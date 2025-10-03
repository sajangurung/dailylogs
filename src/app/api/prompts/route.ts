import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_DIR = path.join(DATA_DIR, 'prompts');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
  }

  try {
    const filePath = path.join(PROMPTS_DIR, `${type}.txt`);
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { type, content } = await request.json();

  if (!type || !content) {
    return NextResponse.json(
      { error: 'Type and content are required' },
      { status: 400 }
    );
  }

  try {
    await fs.mkdir(PROMPTS_DIR, { recursive: true });
    const filePath = path.join(PROMPTS_DIR, `${type}.txt`);
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}
