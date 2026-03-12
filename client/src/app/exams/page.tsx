'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Exam {
  id: number;
  title: string;
  duration_minutes: number;
  show_score_after_submit: boolean;
  creator: { id: number; name: string };
  _count: { examQuestions: number };
  created_at: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.getExams().then(setExams).finally(() => setLoading(false));
  }, []);

  const handleStartExam = async (examId: number) => {
    try {
      const attempt = await api.startExam(examId);
      router.push(`/take-exam/${attempt.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start exam');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
        <Link
          href="/create-exam"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + New Exam
        </Link>
      </div>
      {exams.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No exams yet. Create one!</div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl shadow-sm border p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg mb-1">{exam.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{exam.duration_minutes} min</span>
                    <span>{exam._count.examQuestions} questions</span>
                    <span>by {exam.creator.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/exam-builder/${exam.id}`}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit Questions
                  </Link>
                  {exam._count.examQuestions > 0 && (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
