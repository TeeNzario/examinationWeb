'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ChoiceInput {
  choice_text: string;
  is_correct: boolean;
}

export default function CreateQuestionPage() {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState<ChoiceInput[]>([
    { choice_text: '', is_correct: true },
    { choice_text: '', is_correct: false },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addChoice = () => {
    setChoices([...choices, { choice_text: '', is_correct: false }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    const newChoices = choices.filter((_, i) => i !== index);
    if (!newChoices.some((c) => c.is_correct)) {
      newChoices[0].is_correct = true;
    }
    setChoices(newChoices);
  };

  const updateChoice = (index: number, text: string) => {
    const newChoices = [...choices];
    newChoices[index].choice_text = text;
    setChoices(newChoices);
  };

  const setCorrect = (index: number) => {
    const newChoices = choices.map((c, i) => ({ ...c, is_correct: i === index }));
    setChoices(newChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }
    if (choices.some((c) => !c.choice_text.trim())) {
      setError('All choices must have text');
      return;
    }
    setLoading(true);
    try {
      await api.createQuestion({ question_text: questionText, choices });
      router.push('/questions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Question</h1>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Choices</label>
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrect(index)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                    choice.is_correct
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  title="Mark as correct"
                />
                <input
                  type="text"
                  value={choice.choice_text}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addChoice}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add Choice
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  );
}
