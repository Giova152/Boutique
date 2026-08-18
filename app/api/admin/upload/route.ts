import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/app/api/admin/require-admin";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file to Base64 Data URI for Vercel Serverless compatibility
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      if (file.name.toLowerCase().endsWith(".ico")) {
        mimeType = "image/x-icon";
      } else if (file.name.toLowerCase().endsWith(".svg")) {
        mimeType = "image/svg+xml";
      } else {
        mimeType = "image/png";
      }
    }
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de téléversement du fichier" },
      { status: 500 }
    );
  }
}
