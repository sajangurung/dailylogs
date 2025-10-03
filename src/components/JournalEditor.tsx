'use client';

import { useState, useEffect, useRef } from 'react';
import { getEntry, saveEntry } from '@/lib/storage';

export default function JournalEditor() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastSavedContent = useRef('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const loadTodayEntry = async () => {
      const entry = await getEntry(new Date());
      setContent(entry || '');
      lastSavedContent.current = entry || '';
    };
    loadTodayEntry();
  }, []);

  const saveContent = async (newContent: string) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await saveEntry(new Date(), newContent);
      lastSavedContent.current = newContent;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if content hasn't changed
    if (content === lastSavedContent.current) return;

    // Set new timeout for saving
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(content);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Today's Entry</h1>
          <div className="text-sm text-gray-500">
            {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
            {isSaving && ' (Saving...)'}
          </div>
        </div>
        <textarea
          className="w-full h-[70vh] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts for today..."
        />
      </div>
    </div>
  );
}
