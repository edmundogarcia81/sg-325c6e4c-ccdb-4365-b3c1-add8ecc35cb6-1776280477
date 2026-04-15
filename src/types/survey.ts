export type QuestionType = "choice" | "open";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: CategoryId;
  text: string;
  description?: string;
  options?: QuestionOption[];
  required: boolean;
  allowNotMyRole?: boolean;
}

export interface Answer {
  questionId: string;
  value: string | null;
  isNotMyRole?: boolean;
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
  | "priority"
  | "closing";

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
}

export interface SurveyState {
  answers: Record<string, Answer>;
  currentCategory: CategoryId;
  completedCategories: CategoryId[];
}