export type QuestionType = "likert" | "boolean" | "open" | "multiple";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

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
  value: LikertValue | boolean | string | string[] | null;
  isNotMyRole?: boolean;
  openText?: string;
}

export type CategoryId = 
  | "revenue"
  | "expenses"
  | "reconciliation"
  | "cashflow"
  | "tax"
  | "assets"
  | "reporting";

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

export interface MaturityScore {
  category: CategoryId;
  score: number;
  maxScore: number;
  percentage: number;
  level: "Inicial" | "Básico" | "Intermedio" | "Avanzado" | "Optimizado";
}