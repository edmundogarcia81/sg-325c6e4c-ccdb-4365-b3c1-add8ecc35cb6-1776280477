import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Question } from "@/services/surveyConfigService";
import type { Tables } from "@/integrations/supabase/types";

type SurveyResponse = Tables<"survey_responses">;

interface QuestionCardProps {
  question: Question;
  response?: SurveyResponse;
  onResponseChange: (questionId: string, value: string | null, isNotMyRole: boolean) => void;
}

export function QuestionCard({ question, response, onResponseChange }: QuestionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string>(response?.answer_value || "");
  const [isNotMyRole, setIsNotMyRole] = useState(response?.is_not_my_role || false);

  useEffect(() => {
    setSelectedValue(response?.answer_value || "");
    setIsNotMyRole(response?.is_not_my_role || false);
  }, [response]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    setIsNotMyRole(false);
    onResponseChange(question.id, value, false);
  };

  const handleNotMyRoleChange = (checked: boolean) => {
    setIsNotMyRole(checked);
    if (checked) {
      setSelectedValue("");
      onResponseChange(question.id, null, true);
    } else {
      onResponseChange(question.id, selectedValue || null, false);
    }
  };

  // Parse options from JSONB string
  const options = question.options ? 
    (typeof question.options === "string" ? JSON.parse(question.options) : question.options) 
    : [];

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium leading-relaxed block">
            {question.text}
          </Label>

          {!isNotMyRole && (
            <>
              {question.type === "likert" && options.length > 0 && (
                <RadioGroup
                  value={selectedValue}
                  onValueChange={handleValueChange}
                  className="space-y-3"
                >
                  {options.map((option: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <RadioGroupItem value={option} id={`${question.id}-${index}`} className="mt-1" />
                      <Label
                        htmlFor={`${question.id}-${index}`}
                        className="font-normal leading-relaxed cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "yesno" && (
                <RadioGroup
                  value={selectedValue}
                  onValueChange={handleValueChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Sí" id={`${question.id}-yes`} />
                    <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="No" id={`${question.id}-no`} />
                    <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {question.type === "open" && (
                <Textarea
                  value={selectedValue}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Escriba su respuesta aquí..."
                  className="min-h-[120px] resize-none"
                />
              )}
            </>
          )}

          <div className="flex items-center space-x-2 pt-4 border-t border-border">
            <Checkbox
              id={`${question.id}-not-my-role`}
              checked={isNotMyRole}
              onCheckedChange={handleNotMyRoleChange}
            />
            <Label
              htmlFor={`${question.id}-not-my-role`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              No es mi rol / No aplica
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}