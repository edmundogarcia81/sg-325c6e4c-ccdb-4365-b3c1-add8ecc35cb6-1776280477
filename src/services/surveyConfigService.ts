import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type Question = Tables<"questions">;

export interface CategoryWithQuestions extends Category {
  questions: Question[];
}

export const surveyConfigService = {
  // Categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("position");

    if (error) throw error;
    return data;
  },

  async getCategoriesWithQuestions() {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        questions (*)
      `)
      .order("position");

    if (error) throw error;

    return (data || []).map(cat => ({
      ...cat,
      questions: (cat.questions || []).sort((a: any, b: any) => a.position - b.position)
    })) as CategoryWithQuestions[];
  },

  async createCategory(category: { title: string; description: string; position: number }) {
    const id = `cat-${Date.now()}`;
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...category, id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async reorderCategories(categoryIds: string[]) {
    const updates = categoryIds.map((id, index) => ({
      id,
      position: index + 1
    }));

    for (const update of updates) {
      await supabase
        .from("categories")
        .update({ position: update.position })
        .eq("id", update.id);
    }

    return true;
  },

  // Questions
  async getQuestionsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("category_id", categoryId)
      .order("position");

    if (error) throw error;
    return data;
  },

  async createQuestion(question: {
    category_id: string;
    text: string;
    type: "likert" | "yesno" | "open";
    options?: string[];
    position: number;
  }) {
    const id = `q-${Date.now()}`;
    const { data, error } = await supabase
      .from("questions")
      .insert({
        ...question,
        id,
        options: question.options ? JSON.stringify(question.options) : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuestion(id: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from("questions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async reorderQuestions(questionIds: string[]) {
    const updates = questionIds.map((id, index) => ({
      id,
      position: index + 1
    }));

    for (const update of updates) {
      await supabase
        .from("questions")
        .update({ position: update.position })
        .eq("id", update.id);
    }

    return true;
  }
};