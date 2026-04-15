import { Check } from "lucide-react";
import { categories } from "@/lib/surveyData";
import type { CategoryId } from "@/types/survey";

interface SurveyProgressProps {
  currentCategory: CategoryId;
  completedCategories: CategoryId[];
  progress: number;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

export function SurveyProgress({ 
  currentCategory, 
  completedCategories, 
  progress,
  onSelectCategory
}: SurveyProgressProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm h-fit sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground">
          Progreso de la Encuesta
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedCategories.length} / {categories.length} secciones
        </span>
      </div>

      <div className="space-y-1 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        <div className="relative z-10 flex flex-col gap-4">
          {categories.map((category, index) => {
            const isCompleted = completedCategories.includes(category.id);
            const isCurrent = currentCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory?.(category.id)}
                disabled={!isCompleted && !isCurrent}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors text-left ${
                  isCurrent 
                    ? "bg-primary/5 border border-primary/20" 
                    : isCompleted && onSelectCategory
                      ? "hover:bg-muted cursor-pointer"
                      : "cursor-default"
                }`}
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