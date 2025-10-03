const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export async function saveEntry(date: Date, content: string) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: formatDate(date),
      content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save entry');
  }

  return response.json();
}

export async function getEntry(date: Date): Promise<string | null> {
  const response = await fetch(`/api/entries?date=${formatDate(date)}`);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.content;
}

export async function getEntriesInRange(startDate: Date, endDate: Date): Promise<{ date: Date; content: string }[]> {
  const entries: { date: Date; content: string }[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const content = await getEntry(current);
    if (content) {
      entries.push({ date: new Date(current), content });
    }
    current.setDate(current.getDate() + 1);
  }

  return entries;
}

export async function saveSummary(type: string, date: Date, content: string) {
  const response = await fetch('/api/summaries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      date: formatDate(date),
      content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save summary');
  }

  return response.json();
}

export async function getPrompt(type: string): Promise<string> {
  const response = await fetch(`/api/prompts?type=${type}`);

  if (!response.ok) {
    throw new Error(`Prompt template for ${type} not found`);
  }

  const data = await response.json();
  return data.content;
}

export async function savePrompt(type: string, content: string) {
  const response = await fetch('/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save prompt');
  }

  return response.json();
}
