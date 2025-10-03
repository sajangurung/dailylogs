'use client';

import { useState } from 'react';
import { generateWithOllama } from '@/lib/ollama';
import { getEntriesInRange, getPrompt, saveSummary } from '@/lib/storage';

type RetroType = 'sprint' | 'quarterly' | 'biannual' | 'annual';

const RETRO_RANGES: Record<RetroType, number> = {
  sprint: 14, // 2 weeks
  quarterly: 90, // 3 months
  biannual: 180, // 6 months
  annual: 365, // 1 year
};

export default function RetroGenerator() {
  const [retroType, setRetroType] = useState<RetroType>('sprint');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const generateRetro = async () => {
    setIsGenerating(true);
    setError('');
    setSummary('');

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - RETRO_RANGES[retroType]);

      const entries = await getEntriesInRange(startDate, endDate);
      if (entries.length === 0) {
        throw new Error('No entries found in the selected date range');
      }

      const prompt = await getPrompt(retroType);
      const context = entries
        .map(entry => `Date: ${entry.date.toISOString().split('T')[0]}\n${entry.content}`)
        .join('\n\n');

      const generated = await generateWithOllama(
        prompt,
        context,
        (token) => {
          setSummary(prev => prev + token);
        }
      );

      await saveSummary(retroType, new Date(), generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-4">Generate Retro</h1>
          <div className="flex gap-4 mb-4">
            <select
              className="p-2 border rounded"
              value={retroType}
              onChange={(e) => setRetroType(e.target.value as RetroType)}
            >
              <option value="sprint">Sprint (2 weeks)</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Bi-annual</option>
              <option value="annual">Annual</option>
            </select>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              onClick={generateRetro}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          {summary && (
            <div className="p-4 border rounded-lg bg-white">
              <pre className="whitespace-pre-wrap">{summary}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
