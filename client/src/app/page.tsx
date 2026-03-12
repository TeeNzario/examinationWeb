'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Examination System</h1>
        <p className="text-lg text-gray-500 mb-8">Create and take exams online</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/questions"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">Question Bank</h2>
          <p className="text-gray-500">Create and manage reusable questions</p>
        </Link>
        <Link
          href="/exams"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">Exams</h2>
          <p className="text-gray-500">Create exams and manage questions</p>
        </Link>
        <Link
          href="/create-question"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">New Question</h2>
          <p className="text-gray-500">Add a new question to the bank</p>
        </Link>
      </div>
    </div>
  );
}
