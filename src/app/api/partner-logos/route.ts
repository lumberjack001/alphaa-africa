import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const partnersDir = path.join(process.cwd(), 'public', 'partners');
    if (!fs.existsSync(partnersDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(partnersDir);
    const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif'];
    const imageFiles = files
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/partners/${file}`);
    
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error reading partners directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
