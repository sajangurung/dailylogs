import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUMMARIES_DIR = path.join(DATA_DIR, 'summaries');

export async function POST(request: Request) {
  const { type, date, content } = await request.json();

  if (!type || !date || !content) {
    return NextResponse.json(
      { error: 'Type, date, and content are required' },
      { status: 400 }
    );
  }

  try {
    await fs.mkdir(SUMMARIES_DIR, { recursive: true });
    const fileName = `${date}_${type}.txt`;
    const filePath = path.join(SUMMARIES_DIR, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save summary' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const date = searchParams.get('date');

  if (!type || !date) {
    return NextResponse.json(
      { error: 'Type and date parameters are required' },
      { status: 400 }
    );
  }

  try {
    const fileName = `${date}_${type}.txt`;
    const filePath = path.join(SUMMARIES_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: null });
  }
}