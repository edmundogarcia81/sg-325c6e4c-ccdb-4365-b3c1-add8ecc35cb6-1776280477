import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { Question, Answer, LikertValue } from "@/types/survey";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  questionNumber: number;
}

const likertLabels: Record<LikertValue, string> = {
  1: "Nada",
  2: "Poco",
  3: "Moderado",
  4: "Bastante",
  5: "Totalmente"
};

export function QuestionCard({ question, answer, onAnswer, questionNumber }: QuestionCardProps) {
  const [isNotMyRole, setIsNotMyRole] = useState(answer?.isNotMyRole || false);

  const handleLikertChange = (value: string) => {
    onAnswer({
      questionId: question.id,
      value: parseInt(value) as LikertValue,
      isNotMyRole: false
    });
    setIsNotMyRole(false);
  };

  const handleBooleanChange = (value: string) => {
    onAnswer({
      questionId: question.id,
      value: value === "true",
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

  const handleMultipleChange = (value: string) => {
    onAnswer({
      questionId: question.id,
      value: [value],
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
                <h3 className="font-medium text-foreground mb-1">¿Algun otro proceso que no se incluya en la parte de ingresos?*




                </h3>
                {question.description &&
                <p className="text-sm text-muted-foreground">Describa áreas de oportunidad que no haya visto en la presentación

                </p>
                }
              </div>
            </div>
          </div>

          {!isNotMyRole &&
          <div className="pl-8">
              {question.type === "likert" &&
            <RadioGroup
              value={answer?.value?.toString()}
              onValueChange={handleLikertChange}
              className="space-y-2">
              
                  {([1, 2, 3, 4, 5] as LikertValue[]).map((value) =>
              <div key={value} className="flex items-center space-x-3">
                      <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                      <Label
                  htmlFor={`${question.id}-${value}`}
                  className="text-sm font-normal cursor-pointer">
                  
                        {value} - {likertLabels[value]}
                      </Label>
                    </div>
              )}
                </RadioGroup>
            }

              {question.type === "boolean" &&
            <RadioGroup
              value={answer?.value?.toString()}
              onValueChange={handleBooleanChange}
              className="space-y-2">
              
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="true" id={`${question.id}-yes`} />
                    <Label
                  htmlFor={`${question.id}-yes`}
                  className="text-sm font-normal cursor-pointer">
                  
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="false" id={`${question.id}-no`} />
                    <Label
                  htmlFor={`${question.id}-no`}
                  className="text-sm font-normal cursor-pointer">
                  
                      No
                    </Label>
                  </div>
                </RadioGroup>
            }

              {question.type === "open" &&
            <div>
                  <Textarea
                value={answer?.value as string || ""}
                onChange={(e) => handleOpenTextChange(e.target.value)}
                placeholder="Describa los procesos, desafíos o brechas que enfrenta..."
                className="min-h-[120px] resize-none" />
              
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Esta información ayudará a identificar áreas de mejora específicas
                  </p>
                </div>
            }

              {question.type === "multiple" && question.options &&
            <RadioGroup
              value={Array.isArray(answer?.value) ? answer.value[0] : ""}
              onValueChange={handleMultipleChange}
              className="space-y-2">
              
                  {question.options.map((option) =>
              <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                  value={option.value}
                  id={`${question.id}-${option.value}`} />
                
                      <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer">
                  
                        {option.label}
                      </Label>
                    </div>
              )}
                </RadioGroup>
            }
            </div>
          }

          {question.allowNotMyRole &&
          <div className="pl-8 pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <Checkbox
                id={`${question.id}-not-my-role`}
                checked={isNotMyRole}
                onCheckedChange={handleNotMyRoleToggle} />
              
                <Label
                htmlFor={`${question.id}-not-my-role`}
                className="text-sm text-muted-foreground font-normal cursor-pointer">
                
                  No es mi rol / No aplica
                </Label>
              </div>
            </div>
          }
        </div>
      </CardContent>
    </Card>);

}