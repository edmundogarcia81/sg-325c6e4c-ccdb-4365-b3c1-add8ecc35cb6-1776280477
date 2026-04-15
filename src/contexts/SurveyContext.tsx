import { createContext, useContext, useState, ReactNode } from "react";
import type { SurveyState, Answer, CategoryId } from "@/types/survey";

interface SurveyContextType {
  state: SurveyState;
  setAnswer: (answer: Answer) => void;
  setCurrentCategory: (category: CategoryId) => void;
  markCategoryComplete: (category: CategoryId) => void;
  resetSurvey: () => void;
  getProgress: () => number;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const initialState: SurveyState = {
  answers: {},
  currentCategory: "general",
  completedCategories: []
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SurveyState>(initialState);

  const setAnswer = (answer: Answer) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [answer.questionId]: answer
      }
    }));
  };

  const setCurrentCategory = (category: CategoryId) => {
    setState(prev => ({ ...prev, currentCategory: category }));
  };

  const markCategoryComplete = (category: CategoryId) => {
    setState(prev => ({
      ...prev,
      completedCategories: prev.completedCategories.includes(category)
        ? prev.completedCategories
        : [...prev.completedCategories, category]
    }));
  };

  const resetSurvey = () => {
    setState(initialState);
  };

  const getProgress = () => {
    const totalCategories = 11;
    return Math.round((state.completedCategories.length / totalCategories) * 100);
  };

  return (
    <SurveyContext.Provider
      value={{
        state,
        setAnswer,
        setCurrentCategory,
        markCategoryComplete,
        resetSurvey,
        getProgress
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within SurveyProvider");
  }
  return context;
}