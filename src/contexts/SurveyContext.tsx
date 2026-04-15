import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { SurveyState, CategoryId, Answer } from "@/types/survey";
import { categories } from "@/lib/surveyData";
import { surveyService } from "@/services/surveyService";

interface SurveyContextType {
  state: SurveyState;
  setAnswer: (questionId: string, answer: Answer) => void;
  setCurrentCategory: (category: CategoryId) => void;
  markCategoryComplete: (category: CategoryId) => void;
  resetSurvey: () => void;
  getProgress: () => number;
  saveToDatabaseAndSendEmail: () => Promise<void>;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const initialState: SurveyState = {
  answers: {},
  currentCategory: "general",
  completedCategories: []
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SurveyState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem("surveyState");
    if (saved) {
      setState(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("surveyState", JSON.stringify(state));
  }, [state]);

  const setAnswer = async (questionId: string, answer: Answer) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));

    // Guardar en Supabase si tenemos surveyId
    const surveyId = localStorage.getItem("currentSurveyId");
    if (surveyId) {
      try {
        await surveyService.saveResponse({
          surveyId,
          questionId,
          answerValue: answer.value,
          isNotMyRole: answer.isNotMyRole
        });
      } catch (error) {
        console.error("Error saving response:", error);
      }
    }
  };

  const setCurrentCategory = (category: CategoryId) => {
    setState(prev => ({ ...prev, currentCategory: category }));
  };

  const markCategoryComplete = (category: CategoryId) => {
    setState(prev => ({
      ...prev,
      completedCategories: [...new Set([...prev.completedCategories, category])]
    }));
  };

  const resetSurvey = () => {
    setState(initialState);
    localStorage.removeItem("surveyState");
    localStorage.removeItem("currentSurveyId");
    localStorage.removeItem("surveyEmail");
  };

  const getProgress = () => {
    const totalCategories = 11;
    return Math.round((state.completedCategories.length / totalCategories) * 100);
  };

  const saveToDatabaseAndSendEmail = async () => {
    const surveyId = localStorage.getItem("currentSurveyId");
    const email = localStorage.getItem("surveyEmail");
    const name = localStorage.getItem("surveyName");

    if (!surveyId || !email || !name) {
      throw new Error("Missing survey information");
    }

    // Marcar encuesta como completada
    const survey = await surveyService.completeSurvey(surveyId);
    
    // Enviar email con resumen
    await surveyService.sendSurveyEmail(email, name, survey.unique_link_token, state.answers);
  };

  return (
    <SurveyContext.Provider
      value={{
        state,
        setAnswer,
        setCurrentCategory,
        markCategoryComplete,
        resetSurvey,
        getProgress,
        saveToDatabaseAndSendEmail
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