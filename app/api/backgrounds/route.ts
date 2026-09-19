import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backgroundsDir = path.join(process.cwd(), "public", "Backgrounds");
    
    // Check if directory exists
    if (!fs.existsSync(backgroundsDir)) {
      return NextResponse.json({ images: [] });
    }

    // Read files in the directory
    const files = fs.readdirSync(backgroundsDir);
    
    // Filter out only image files and map them to their public paths
    const images = files
      .filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map(file => `/Backgrounds/${file}`);

    // If no images found, return empty array
    if (images.length === 0) {
      return NextResponse.json({ images: [] });
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Failed to read backgrounds directory:", error);
    return NextResponse.json(
      { error: "Failed to load backgrounds", images: [] },
      { status: 500 }
    );
  }
}
