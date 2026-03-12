'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Choice {
  id: number;
  choice_text: string;
  question_id: number;
}

interface ExamQuestion {
  id: number;
  question_text: string;
  order_index: number;
  choices: Choice[];
  selected_choice_id: number | null;
}

interface AttemptData {
  attempt_id: number;
  exam_title: string;
  status: string;
  start_time: string;
  end_time: string;
  questions: ExamQuestion[];
}

export default function TakeExamClient() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params.attemptId);

  const [data, setData] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAttemptQuestions(attemptId).then((res) => {
      setData(res);
      const saved: Record<number, number> = {};
      res.questions.forEach((q: ExamQuestion) => {
        if (q.selected_choice_id) saved[q.id] = q.selected_choice_id;
      });
      setAnswers(saved);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load exam');
      setLoading(false);
    });
  }, [attemptId]);

  useEffect(() => {
    if (!data) return;
    const endTime = new Date(data.end_time).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft('Time is up!');
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const selectAnswer = useCallback(async (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    try {
      await api.saveAnswer({ attempt_id: attemptId, question_id: questionId, choice_id: choiceId });
    } catch {
      // Answer save failed silently - user can retry
    }
  }, [attemptId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.submitExam(attemptId);
      router.push(`/result/${attemptId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading exam...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">{error || 'Exam not found'}</div>;
  if (data.status === 'submitted') {
    router.push(`/result/${attemptId}`);
    return null;
  }

  const questions = data.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{data.exam_title}</h1>
          <p className="text-sm text-gray-500">
            {answeredCount}/{questions.length} answered
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-mono font-bold ${timeLeft === 'Time is up!' ? 'text-red-600' : 'text-indigo-600'}`}>
            {timeLeft}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Question navigator */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
              i === currentIndex
                ? 'bg-indigo-600 text-white'
                : answers[q.id]
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <p className="text-sm text-gray-400 mb-2">Question {currentIndex + 1} of {questions.length}</p>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{currentQuestion.question_text}</h2>
        <div className="space-y-3">
          {currentQuestion.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => selectAnswer(currentQuestion.id, choice.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                answers[currentQuestion.id] === choice.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-700'
              }`}
            >
              {choice.choice_text}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
