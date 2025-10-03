import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ENTRIES_DIR = path.join(DATA_DIR, 'entries');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const [year, month, day] = date.split('-');
    const filePath = path.join(ENTRIES_DIR, year, month, `${day}.txt`);
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: null });
  }
}

export async function POST(request: Request) {
  const { date, content } = await request.json();

  if (!date) {
    return NextResponse.json(
      { error: 'Date is required' },
      { status: 400 }
    );
  }

  // Allow empty string content, but ensure it's a string
  const contentToSave = content ?? '';

  try {
    const [year, month, day] = date.split('-');
    const yearDir = path.join(ENTRIES_DIR, year);
    const monthDir = path.join(yearDir, month);

    await fs.mkdir(yearDir, { recursive: true });
    await fs.mkdir(monthDir, { recursive: true });

    const filePath = path.join(monthDir, `${day}.txt`);
    await fs.writeFile(filePath, contentToSave, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save entry' },
      { status: 500 }
    );
  }
}
