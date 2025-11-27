// server/api/groundedAnswer.ts (or app/api/chat/route.ts handler)
import { OpenAI } from "openai"; // or your openai sdk import
import { PineconeClient } from "@pinecone-database/pinecone";
import { PINECONE_TOP_K, PINECONE_INDEX_NAME, MODEL } from "../config"; // adjust path

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pinecone = new PineconeClient();
await pinecone.init({ apiKey: process.env.PINECONE_API_KEY, environment: process.env.PINECONE_ENV });

const SIMILARITY_THRESHOLD = 0.75; // tune this

async function embedQuery(query: string) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small", // choose model you use for embeddings
    input: query,
  });
  return resp.data[0].embedding;
}

async function fetchFromPinecone(vector: number[], topK = PINECONE_TOP_K) {
  const index = pinecone.Index(PINECONE_INDEX_NAME);
  const queryResp = await index.query({
    vector,
    topK,
    includeMetadata: true,
    includeValues: false,
  });
  return queryResp.matches || [];
}

function buildGroundedPrompt(userQuery: string, matches: any[]) {
  // We'll include short snippets plus citation id
  const sourcesText = matches
    .map((m: any, i: number) => {
      const meta = m.metadata || {};
      // make a safe short snippet (truncate)
      const snippet = (meta.text || meta.content || "").slice(0, 800).replace(/\n+/g, " ");
      const id = meta.id || meta.source || `doc-${i + 1}`;
      return `SOURCE ${i + 1}: [id=${id}]\n${snippet}\n`;
    })
    .join("\n---\n");

  // system instruction: very strict
  const system = `You are BINGIO. Answer the user's question using ONLY the information from the provided SOURCES.
Do NOT invent facts, do NOT use outside knowledge beyond the sources.
If the answer is not contained in the sources, reply exactly: "I don't know."`;

  const userPrompt = `User question: ${userQuery}\n\nUse the sources below to answer. Cite sources inline like [SOURCE 1] when referring to them.`;

  return `${system}\n\n${sourcesText}\n\n${userPrompt}`;
}

export default async function handler(req, res) {
  try {
    const { query } = req.body; // user query text

    // 1) embed query
    const qvec = await embedQuery(query);

    // 2) fetch from pinecone
    const matches = await fetchFromPinecone(qvec);

    // 3) optional: convert raw pinecone score to similarity and filter
    // Pinecone returns 'score' (depends on index metric - often cosine). We'll use it directly.
    const goodMatches = matches.filter((m: any) => (m.score ?? 0) >= SIMILARITY_THRESHOLD).slice(0, PINECONE_TOP_K);

    if (!goodMatches.length) {
      // No good match: be honest and refuse to hallucinate
      return res.status(200).json({ answer: "I don't know.", reasons: "No relevant documents found." });
    }

    // 4) build prompt (only include the good matches)
    const groundedPrompt = buildGroundedPrompt(query, goodMatches);

    // 5) call LLM with deterministic params
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", // or whichever model you prefer
      messages: [
        { role: "system", content: groundedPrompt },
        // If you want the model to be brief:
        { role: "user", content: "Answer concisely. 2-3 sentences max." }
      ],
      temperature: 0,
      max_tokens: 400,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() ?? "I don't know.";

    return res.status(200).json({ answer, sources: goodMatches.map((m: any, i: number) => ({ source: m.metadata?.id || `SOURCE ${i+1}`, score: m.score })) });
  } catch (err) {
    console.error("grounded error", err);
    return res.status(500).json({ error: String(err) });
  }
}
