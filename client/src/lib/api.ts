const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // Questions
  getQuestions: () => request('/questions'),
  getQuestion: (id: number) => request(`/questions/${id}`),
  createQuestion: (data: { question_text: string; choices: { choice_text: string; is_correct: boolean }[] }) =>
    request('/questions', { method: 'POST', body: JSON.stringify(data) }),

  // Exams
  getExams: () => request('/exams'),
  getExam: (id: number) => request(`/exams/${id}`),
  createExam: (data: { title: string; duration_minutes: number; show_score_after_submit: boolean }) =>
    request('/exams', { method: 'POST', body: JSON.stringify(data) }),
  setExamQuestions: (examId: number, questions: { question_id: number; order_index: number }[]) =>
    request(`/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify({ questions }) }),

  // Exam Attempt
  startExam: (exam_id: number) =>
    request('/exam-attempt/start', { method: 'POST', body: JSON.stringify({ exam_id }) }),
  getAttemptQuestions: (attemptId: number) =>
    request(`/exam-attempt/${attemptId}/questions`),
  submitExam: (attempt_id: number) =>
    request('/exam-attempt/submit', { method: 'POST', body: JSON.stringify({ attempt_id }) }),
  getResult: (attemptId: number) =>
    request(`/exam-attempt/${attemptId}/result`),

  // Answers
  saveAnswer: (data: { attempt_id: number; question_id: number; choice_id: number }) =>
    request('/answers', { method: 'POST', body: JSON.stringify(data) }),
};
