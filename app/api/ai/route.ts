import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, faqs } = await req.json();

    const formattedFaqs = (faqs || [])
      .map((f: any) => `Q: ${f.question}\nA: ${f.answer}`)
      .join("\n\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are a customer support assistant for a company.

Use the FAQ below to answer questions when possible.

FAQ:
${formattedFaqs}

Rules:
- Prefer FAQ answers if relevant
- If pricing is asked → say a team member will help
- Be helpful and professional
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json({
        reply: "AI did not return a response.",
      });
    }

    return NextResponse.json({
      reply: data.choices[0].message.content,
    });

  } catch (error) {
    return NextResponse.json({
      reply: "Server error. Please try again.",
    });
  }
}
