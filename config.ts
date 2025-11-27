import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import {
  PINECONE_INDEX_NAME,
  PINECONE_TOP_K,
} from "../../../config";

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = client.Index(PINECONE_INDEX_NAME);

// 1) Embed user query
async function embedQuery(input: string) {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });

  return result.data[0].embedding;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = messages[messages.length - 1].content;

    // 2) embed the query
    const queryEmbedding = await embedQuery(userMessage);

    // 3) query Pinecone
    const search = await index.query({
      vector: queryEmbedding,
      topK: PINECONE_TOP_K,
      includeMetadata: true,
    });

    const matches = search.matches ?? [];

    // 4) If nothing is relevant enough → do NOT let GPT hallucinate
    if (matches.length === 0 || matches[0].score < 0.70) {
      return NextResponse.json({
        role: "assistant",
        content: "I don't know. The information is not available in my database.",
      });
    }

    // 5) Build grounded context from Pinecone
    const context = matches
      .map(
        (m, i) =>
          `SOURCE ${i + 1} (score=${m.score}): ${m.metadata?.text ?? ""}`
      )
      .join("\n\n");

    // 6) STRICT ANTI-HALLUCINATION SYSTEM PROMPT
    const systemPrompt = `
You must answer ONLY using the information in the SOURCES provided below.
Do NOT use outside knowledge.
If the answer is not in the sources, reply EXACTLY with "I don't know."
Be concise.

======== SOURCES ========
${context}
=========================
`;

    // 7) Call GPT with grounded context
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0,
    });

    const answer =
      completion.choices?.[0]?.message?.content ??
      "I don't know.";

    return NextResponse.json({
      role: "assistant",
      content: answer,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
