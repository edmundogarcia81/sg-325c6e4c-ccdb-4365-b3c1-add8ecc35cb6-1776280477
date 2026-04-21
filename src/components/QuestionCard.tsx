import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Question } from "@/services/surveyConfigService";
import type { Tables } from "@/integrations/supabase/types";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

type SurveyResponse = Tables<"survey_responses">;

interface QuestionCardProps {
  question: Question;
  response?: SurveyResponse;
  onResponseChange: (questionId: string, value: string | null, isNotMyRole: boolean) => void;
}

export function QuestionCard({ question, response, onResponseChange }: QuestionCardProps) {
  const [isNotMyRole, setIsNotMyRole] = useState(response?.is_not_my_role || false);
  const [selectedValue, setSelectedValue] = useState<string | null>(response?.answer_value || null);
  const [openResponse, setOpenResponse] = useState(response?.answer_value || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (response) {
      setIsNotMyRole(response.is_not_my_role);
      setSelectedValue(response.answer_value);
      setOpenResponse(response.answer_value || "");
    }
  }, [response]);

  const handleSave = async (value: string | null, notMyRole: boolean) => {
    setSaveStatus("saving");
    try {
      await onResponseChange(question.id, value, notMyRole);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleNotMyRoleChange = async (checked: boolean) => {
    setIsNotMyRole(checked);
    if (checked) {
      setSelectedValue(null);
      setOpenResponse("");
    }
    await handleSave(checked ? null : selectedValue, checked);
  };

  const handleChoiceChange = async (value: string) => {
    setSelectedValue(value);
    setIsNotMyRole(false);
    await handleSave(value, false);
  };

  const handleOpenResponseChange = (value: string) => {
    setOpenResponse(value);
  };

  const handleOpenResponseBlur = async () => {
    if (openResponse.trim() !== response?.answer_value) {
      setIsNotMyRole(false);
      await handleSave(openResponse.trim(), false);
    }
  };

  let options: string[] = [];
  try {
    if (question.options) {
      options = typeof question.options === "string" 
        ? JSON.parse(question.options) 
        : (Array.isArray(question.options) ? question.options.map(String) : []);
    }
  } catch (e) {
    options = [];
  }

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base leading-relaxed flex-1">
            {question.text}
          </CardTitle>
          <AutoSaveIndicator status={saveStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type !== "open" && options.length > 0 && (
          <RadioGroup
            value={selectedValue || ""}
            onValueChange={handleChoiceChange}
            disabled={isNotMyRole}
            className="space-y-3"
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className={`flex-1 cursor-pointer ${
                    isNotMyRole ? "text-muted-foreground" : ""
                  }`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "open" && (
          <Textarea
            placeholder="Escribe tu respuesta aquí..."
            value={openResponse}
            onChange={(e) => handleOpenResponseChange(e.target.value)}
            onBlur={handleOpenResponseBlur}
            disabled={isNotMyRole}
            className="min-h-[100px] resize-none"
          />
        )}

        <Separator />

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`not-my-role-${question.id}`}
            checked={isNotMyRole}
            onCheckedChange={handleNotMyRoleChange}
          />
          <Label
            htmlFor={`not-my-role-${question.id}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            No es mi rol
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}