import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const internalUrl =
      process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api/v1";
    const targetUrl = `${internalUrl}/posts`;

    const body = await req.json();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      revalidatePath("/[locale]/news", "page");
      revalidatePath("/[locale]/news/[slug]", "page");
      revalidatePath("/[locale]/sports/[slug]", "page");
      revalidatePath("/[locale]", "page");
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error proxying POST /posts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
