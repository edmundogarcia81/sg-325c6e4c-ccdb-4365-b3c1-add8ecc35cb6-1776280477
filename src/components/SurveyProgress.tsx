import { Check } from "lucide-react";
import { categories } from "@/lib/surveyData";
import type { CategoryId } from "@/types/survey";
import { cn } from "@/lib/utils";

interface SurveyProgressProps {
  currentCategory: CategoryId;
  completedCategories: CategoryId[];
  onCategorySelect: (category: CategoryId) => void;
}

export function SurveyProgress({ 
  currentCategory, 
  completedCategories,
  onCategorySelect 
}: SurveyProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-semibold text-foreground">Progreso de la Encuesta</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {completedCategories.length} / {categories.length} secciones
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-3">
          {categories.map((category, index) => {
            const isCompleted = completedCategories.includes(category.id);
            const isCurrent = currentCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={cn(
                  "relative flex items-start gap-3 w-full text-left p-3 rounded-lg transition-all",
                  "hover:bg-muted/50",
                  isCurrent && "bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all shrink-0",
                    isCompleted
                      ? "bg-accent border-accent text-accent-foreground"
                      : isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3
                    className={cn(
                      "font-medium text-sm mb-0.5 transition-colors",
                      isCurrent ? "text-primary" : "text-foreground"
                    )}
                  >
                    {category.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}