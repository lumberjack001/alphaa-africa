import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const heroDir = path.join(process.cwd(), 'public', 'hero');
    if (!fs.existsSync(heroDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(heroDir);
    const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif'];
    const imageFiles = files
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/hero/${file}`);
    
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error reading hero directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
