'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ResultData {
  attempt_id: number;
  exam_title: string;
  score?: number;
  total?: number;
  message?: string;
  status: string;
}

export default function ResultClient() {
  const params = useParams();
  const attemptId = Number(params.attemptId);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getResult(attemptId)
      .then(setResult)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading result...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!result) return <div className="text-center py-20 text-red-500">Result not found</div>;

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted!</h1>
        <p className="text-gray-500 mb-6">{result.exam_title}</p>

        {result.score !== undefined && result.total !== undefined ? (
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-indigo-600 mb-1">Your Score</p>
            <p className="text-4xl font-bold text-indigo-700">
              {result.score} / {result.total}
            </p>
            <p className="text-sm text-indigo-500 mt-1">
              {Math.round((result.score / result.total) * 100)}%
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-gray-600">{result.message || 'Score is not available for this exam'}</p>
          </div>
        )}

        <Link
          href="/exams"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Exams
        </Link>
      </div>
    </div>
  );
}
