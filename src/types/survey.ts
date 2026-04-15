export type QuestionType = "choice" | "open";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  category: CategoryId;
  text: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  allowNotMyRole: boolean;
}

export interface Answer {
  questionId: string;
  value: string | null;
  isNotMyRole: boolean;
}

export type CategoryId = 
  | "general"
  | "e2e"
  | "revenue"
  | "expenses"
  | "reconciliation"
  | "cashflow"
  | "tax"
  | "assets"
  | "reporting"
  | "priority";

export interface Category {
  id: CategoryId;
  title: string;
  icon: string;
  description: string;
}

export interface SurveyState {
  answers: Record<string, Answer>;
  currentCategory: CategoryId;
  completedCategories: CategoryId[];
}