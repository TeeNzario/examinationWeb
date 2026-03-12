'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Choice {
  id: number;
  choice_text: string;
}

interface Question {
  id: number;
  question_text: string;
  choices: Choice[];
}

interface ExamQuestion {
  id: number;
  question_id: number;
  order_index: number;
  question: Question;
}

interface Exam {
  id: number;
  title: string;
  examQuestions: ExamQuestion[];
}

interface BankQuestion {
  id: number;
  question_text: string;
  choices: Choice[];
}

function SortableCard({ eq, index }: { eq: ExamQuestion; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: eq.question_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition"
    >
      <div className="flex items-start gap-3">
        <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div>
          <p className="font-medium text-gray-800">{eq.question.question_text}</p>
          <p className="text-xs text-gray-400 mt-1">{eq.question.choices.length} choices</p>
        </div>
      </div>
    </div>
  );
}

export default function ExamBuilderClient() {
  const params = useParams();
  const examId = Number(params.examId);
  const [exam, setExam] = useState<Exam | null>(null);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    Promise.all([api.getExam(examId), api.getQuestions()]).then(([examData, questions]) => {
      setExam(examData);
      setBankQuestions(questions);
      setSelectedQuestions(examData.examQuestions || []);
      setLoading(false);
    });
  }, [examId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedQuestions((items) => {
      const oldIndex = items.findIndex((i) => i.question_id === active.id);
      const newIndex = items.findIndex((i) => i.question_id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const addQuestion = (q: BankQuestion) => {
    if (selectedQuestions.some((sq) => sq.question_id === q.id)) return;
    const newEq: ExamQuestion = {
      id: 0,
      question_id: q.id,
      order_index: selectedQuestions.length,
      question: { id: q.id, question_text: q.question_text, choices: q.choices },
    };
    setSelectedQuestions([...selectedQuestions, newEq]);
  };

  const removeQuestion = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter((sq) => sq.question_id !== questionId));
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const questions = selectedQuestions.map((sq, i) => ({
        question_id: sq.question_id,
        order_index: i,
      }));
      await api.setExamQuestions(examId, questions);
      alert('Questions saved successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!exam) return <div className="text-center py-20 text-red-500">Exam not found</div>;

  const selectedIds = new Set(selectedQuestions.map((sq) => sq.question_id));
  const availableQuestions = bankQuestions.filter((q) => !selectedIds.has(q.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/exams" className="text-indigo-600 hover:underline text-sm">
            &larr; Back to Exams
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">Exam Builder: {exam.title}</h1>
        </div>
        <button
          onClick={saveOrder}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Questions'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected questions with drag and drop */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Exam Questions ({selectedQuestions.length})
          </h2>
          {selectedQuestions.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center text-gray-400">
              Add questions from the bank
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={selectedQuestions.map((sq) => sq.question_id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {selectedQuestions.map((eq, index) => (
                    <div key={eq.question_id} className="relative group">
                      <SortableCard eq={eq} index={index} />
                      <button
                        onClick={() => removeQuestion(eq.question_id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Question bank */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Question Bank ({availableQuestions.length})
          </h2>
          {availableQuestions.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center text-gray-400">
              All questions added
            </div>
          ) : (
            <div className="space-y-3">
              {availableQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border rounded-xl p-4 shadow-sm flex items-start justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{q.question_text}</p>
                    <p className="text-xs text-gray-400 mt-1">{q.choices.length} choices</p>
                  </div>
                  <button
                    onClick={() => addQuestion(q)}
                    className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 transition shrink-0 ml-3"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
