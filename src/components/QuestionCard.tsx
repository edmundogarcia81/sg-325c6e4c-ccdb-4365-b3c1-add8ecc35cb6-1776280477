import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { Question, Answer } from "@/types/survey";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  questionNumber: number;
}

export function QuestionCard({ question, answer, onAnswer, questionNumber }: QuestionCardProps) {
  const [isNotMyRole, setIsNotMyRole] = useState(answer?.isNotMyRole || false);

  const handleChoiceChange = (value: string) => {
    onAnswer({
      questionId: question.id,
      value: value,
      isNotMyRole: false
    });
    setIsNotMyRole(false);
  };

  const handleOpenTextChange = (text: string) => {
    onAnswer({
      questionId: question.id,
      value: text,
      isNotMyRole: false
    });
    setIsNotMyRole(false);
  };

  const handleNotMyRoleToggle = () => {
    const newIsNotMyRole = !isNotMyRole;
    setIsNotMyRole(newIsNotMyRole);
    onAnswer({
      questionId: question.id,
      value: null,
      isNotMyRole: newIsNotMyRole
    });
  };

  return (
    <Card className={cn(
      "transition-all",
      isNotMyRole && "opacity-60 bg-muted/30"
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <span className="text-sm font-semibold text-primary shrink-0 mt-0.5">
                {questionNumber}.
              </span>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  {question.text}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </h3>
                {question.description && (
                  <p className="text-sm text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isNotMyRole && (
            <div className="pl-8">
              {question.type === "choice" && question.options && (
                <RadioGroup
                  value={(answer?.value as string) || ""}
                  onValueChange={handleChoiceChange}
                  className="space-y-3"
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={option.value}
                        id={`${question.id}-${option.value}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className="text-sm font-normal cursor-pointer leading-snug"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "open" && (
                <div>
                  <Textarea
                    value={(answer?.value as string) || ""}
                    onChange={(e) => handleOpenTextChange(e.target.value)}
                    placeholder="Describa áreas de oportunidad o detalles adicionales..."
                    className="min-h-[120px] resize-none focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Las respuestas abiertas son obligatorias para entender los requerimientos únicos de UNICCO
                  </p>
                </div>
              )}
            </div>
          )}

          {question.allowNotMyRole && (
            <div className="pl-8 pt-4 mt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-not-my-role`}
                  checked={isNotMyRole}
                  onCheckedChange={handleNotMyRoleToggle}
                />
                <Label
                  htmlFor={`${question.id}-not-my-role`}
                  className="text-sm text-muted-foreground font-medium cursor-pointer"
                >
                  No tengo la visibilidad de este proceso / No aplica a mi rol
                </Label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}