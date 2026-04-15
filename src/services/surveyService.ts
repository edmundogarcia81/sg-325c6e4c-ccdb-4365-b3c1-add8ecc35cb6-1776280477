import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface CreateSurveyParams {
  email: string;
  name: string;
}

export interface SaveResponseParams {
  surveyId: string;
  questionId: string;
  answerValue: string | null;
  isNotMyRole: boolean;
}

export const surveyService = {
  async createSurvey(params: CreateSurveyParams) {
    const { data, error } = await supabase
      .from("surveys")
      .insert({ 
        email: params.email,
        name: params.name 
      })
      .select("id, unique_link_token")
      .single();

    if (error) throw error;
    return data;
  },

  async getSurveyByToken(token: string) {
    const { data, error } = await supabase
      .from("surveys")
      .select("*, survey_responses(*)")
      .eq("unique_link_token", token)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllSurveys() {
    const { data, error } = await supabase
      .from("surveys")
      .select("*, survey_responses(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCompletedSurveys() {
    const { data, error } = await supabase
      .from("surveys")
      .select("*, survey_responses(*)")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSurveyStats() {
    const { data: allSurveys, error: allError } = await supabase
      .from("surveys")
      .select("id, completed_at");

    if (allError) throw allError;

    const { data: completedSurveys, error: completedError } = await supabase
      .from("surveys")
      .select("id")
      .not("completed_at", "is", null);

    if (completedError) throw completedError;

    return {
      total: allSurveys.length,
      completed: completedSurveys.length,
      completionRate: allSurveys.length > 0 
        ? Math.round((completedSurveys.length / allSurveys.length) * 100)
        : 0
    };
  },

  async saveResponse(params: SaveResponseParams) {
    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        survey_id: params.surveyId,
        question_id: params.questionId,
        answer_value: params.answerValue,
        is_not_my_role: params.isNotMyRole
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeSurvey(surveyId: string) {
    const { data, error } = await supabase
      .from("surveys")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", surveyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendSurveyEmail(email: string, name: string, token: string, responses: any) {
    const { data, error } = await supabase.functions.invoke("send-survey-email", {
      body: { email, name, token, responses }
    });

    if (error) throw error;
    return data;
  }
};