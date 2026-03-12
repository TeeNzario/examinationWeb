'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function QuestionDetailClient() {
  const params = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.getQuestion(Number(params.id)).then(setQuestion).finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!question) return <div className="text-center py-20 text-red-500">Question not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/questions" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Questions
      </Link>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.question_text}</h1>
        <p className="text-sm text-gray-400 mb-6">Created by {question.creator.name}</p>
        <div className="space-y-3">
          {question.choices.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-lg border ${
                c.is_correct
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              {c.choice_text}
              {c.is_correct && <span className="ml-2 text-xs font-semibold">(Correct)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
