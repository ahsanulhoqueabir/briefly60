export interface AttemptedItem {
  question_index: string;
  is_correct: boolean;
}

export interface AttemptedGroup {
  right_answers: number;
  attempted: AttemptedItem[];
  total_question: number;
}

export interface CreateQuizPayload {
  news: string;
  user?: string;
  attempted?: AttemptedGroup[];
}
