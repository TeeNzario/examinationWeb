'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ExamSystem
        </Link>
        {user ? (
          <div className="flex items-center gap-6">
            <Link href="/questions" className="text-gray-600 hover:text-indigo-600 transition">
              Questions
            </Link>
            <Link href="/exams" className="text-gray-600 hover:text-indigo-600 transition">
              Exams
            </Link>
            <span className="text-sm text-gray-500">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
