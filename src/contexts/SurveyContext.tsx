import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { surveyService } from "@/services/surveyService";
import { surveyConfigService, type CategoryWithQuestions, type Question } from "@/services/surveyConfigService";
import type { Tables } from "@/integrations/supabase/types";

type Survey = Tables<"surveys">;
type SurveyResponse = Tables<"survey_responses">;

interface SurveyContextType {
  email: string;
  name: string;
  surveyId: string | null;
  uniqueToken: string | null;
  categories: CategoryWithQuestions[];
  responses: Record<string, SurveyResponse>;
  currentCategoryIndex: number;
  loadingSurveyConfig: boolean;
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setCurrentCategoryIndex: (index: number) => void;
  saveSurveyResponse: (questionId: string, answerValue: string | null, isNotMyRole: boolean) => Promise<void>;
  loadSurvey: (email: string, name: string) => Promise<string>;
  loadExistingSurvey: (token: string) => Promise<void>;
  completeSurvey: () => Promise<void>;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [uniqueToken, setUniqueToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithQuestions[]>([]);
  const [responses, setResponses] = useState<Record<string, SurveyResponse>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loadingSurveyConfig, setLoadingSurveyConfig] = useState(true);

  // Load survey configuration on mount
  useEffect(() => {
    loadSurveyConfig();
    loadFromLocalStorage();
  }, []);

  const loadFromLocalStorage = () => {
    console.log("📂 Loading from localStorage...");
    const storedEmail = localStorage.getItem("surveyEmail");
    const storedName = localStorage.getItem("surveyName");
    const storedId = localStorage.getItem("currentSurveyId");
    
    console.log("📦 LocalStorage data:", { storedEmail, storedName, storedId });

    if (storedEmail && storedName && storedId) {
      setEmail(storedEmail);
      setName(storedName);
      setSurveyId(storedId);
      console.log("✅ Survey data loaded from localStorage");
    } else {
      console.log("⚠️ No survey data in localStorage");
    }
  };

  const loadSurveyConfig = async () => {
    try {
      console.log("🔧 Loading survey config...");
      setLoadingSurveyConfig(true);
      const data = await surveyConfigService.getCategoriesWithQuestions();
      console.log("✅ Survey config loaded:", data.length, "categories");
      setCategories(data);
    } catch (error) {
      console.error("❌ Error loading survey config:", error);
    } finally {
      setLoadingSurveyConfig(false);
    }
  };

  const loadSurvey = async (email: string, name: string) => {
    try {
      console.log("loadSurvey called with:", { email, name });
      const survey = await surveyService.createSurvey({ email, name });
      console.log("Survey created in loadSurvey:", survey);
      setSurveyId(survey.id);
      setUniqueToken(survey.unique_link_token);
      setEmail(email);
      setName(name);
      return survey.unique_link_token;
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    }
  };

  const loadExistingSurvey = async (token: string) => {
    try {
      const survey = await surveyService.getSurveyByToken(token);
      setSurveyId(survey.id);
      setUniqueToken(survey.unique_link_token);
      setEmail(survey.email);
      setName(survey.name);

      const responsesMap: Record<string, SurveyResponse> = {};
      (survey.survey_responses || []).forEach((response) => {
        responsesMap[response.question_id] = response;
      });
      setResponses(responsesMap);
    } catch (error) {
      console.error("Error loading survey:", error);
      throw error;
    }
  };

  const saveSurveyResponse = async (
    questionId: string,
    answerValue: string | null,
    isNotMyRole: boolean
  ) => {
    if (!surveyId) throw new Error("No survey ID");

    try {
      const response = await surveyService.saveResponse({
        surveyId,
        questionId,
        answerValue,
        isNotMyRole,
      });

      setResponses((prev) => ({
        ...prev,
        [questionId]: response,
      }));
    } catch (error) {
      console.error("Error saving response:", error);
      throw error;
    }
  };

  const completeSurvey = async () => {
    if (!surveyId) throw new Error("No survey ID");
    
    console.log("📧 Completing survey and sending email...");
    
    try {
      // Mark survey as completed
      await surveyService.completeSurvey(surveyId);
      console.log("✅ Survey marked as completed");
      
      // Send email with results
      if (email && name && uniqueToken) {
        console.log("📨 Sending email to:", email);
        await surveyService.sendSurveyEmail(email, name, uniqueToken, responses);
        console.log("✅ Email sent successfully");
      } else {
        console.warn("⚠️ Missing email data:", { email, name, uniqueToken });
      }
    } catch (error) {
      console.error("❌ Error completing survey:", error);
      throw error;
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        email,
        name,
        surveyId,
        uniqueToken,
        categories,
        responses,
        currentCategoryIndex,
        loadingSurveyConfig,
        setEmail,
        setName,
        setCurrentCategoryIndex,
        saveSurveyResponse,
        loadSurvey,
        loadExistingSurvey,
        completeSurvey,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider");
  }
  return context;
}