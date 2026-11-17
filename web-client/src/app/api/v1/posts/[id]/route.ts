import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const internalUrl =
      process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api/v1";
    const targetUrl = `${internalUrl}/posts/${id}`;

    const body = await req.json();

    const response = await fetch(targetUrl, {
      method: "PUT",
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
    console.error(`Error proxying PUT /posts/:id :`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const internalUrl =
      process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api/v1";
    const targetUrl = `${internalUrl}/posts/${id}`;

    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
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
    console.error(`Error proxying DELETE /posts/:id :`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
