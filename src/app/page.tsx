'use client';

import { useState } from 'react';
import JournalEditor from '@/components/JournalEditor';
import RetroGenerator from '@/components/RetroGenerator';
import PromptEditor from '@/components/PromptEditor';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'journal' | 'retro' | 'prompts'>('journal');

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 ${
                activeTab === 'journal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('journal')}
            >
              Journal
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'retro'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('retro')}
            >
              Generate Retro
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'prompts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('prompts')}
            >
              Edit Prompts
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'journal' && <JournalEditor />}
      {activeTab === 'retro' && <RetroGenerator />}
      {activeTab === 'prompts' && <PromptEditor />}
    </main>
  )
}
