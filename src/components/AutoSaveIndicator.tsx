import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-muted-foreground">Guardando...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="w-3 h-3 text-accent" />
          <span className="text-accent">Guardado</span>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Error al guardar</span>
        </>
      )}
    </div>
  );
}