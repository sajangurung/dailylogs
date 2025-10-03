'use client';

import { useState, useEffect } from 'react';
import { getPrompt, savePrompt } from '@/lib/storage';

type PromptType = 'sprint' | 'quarterly' | 'biannual' | 'annual';

export default function PromptEditor() {
  const [promptType, setPromptType] = useState<PromptType>('sprint');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPrompt(promptType);
  }, [promptType]);

  const loadPrompt = async (type: PromptType) => {
    try {
      const promptContent = await getPrompt(type);
      setContent(promptContent);
    } catch (error) {
      setMessage('Error loading prompt template');
      console.error(error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await savePrompt(promptType, content);
      setMessage('Prompt saved successfully');
    } catch (error) {
      setMessage('Error saving prompt');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-4">Edit Prompts</h1>
          <div className="flex gap-4 mb-4">
            <select
              className="p-2 border rounded"
              value={promptType}
              onChange={(e) => setPromptType(e.target.value as PromptType)}
            >
              <option value="sprint">Sprint Retro</option>
              <option value="quarterly">Quarterly Review</option>
              <option value="biannual">Bi-annual Review</option>
              <option value="annual">Annual Review</option>
            </select>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {message && (
            <div className={`mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}
          <textarea
            className="w-full h-[50vh] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter prompt template..."
          />
        </div>
      </div>
    </div>
  );
}
