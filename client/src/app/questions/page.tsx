'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question_text: string;
  choices: Choice[];
  creator: { id: number; name: string };
  created_at: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuestions().then(setQuestions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
        <Link
          href="/create-question"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + New Question
        </Link>
      </div>
      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No questions yet. Create one!</div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className="block bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 mb-2">{q.question_text}</h2>
                  <p className="text-sm text-gray-400">{q.choices.length} choices</p>
                </div>
                <span className="text-xs text-gray-400">by {q.creator.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
