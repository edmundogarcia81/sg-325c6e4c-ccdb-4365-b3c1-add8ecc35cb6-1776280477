import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SEO } from "@/components/SEO";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

export default function StartSurvey() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [incompleteSurvey, setIncompleteSurvey] = useState<any>(null);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return false;
    }
    if (!name.trim() || name.trim().length < 2) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Por favor complete todos los campos correctamente"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check for incomplete survey
      console.log("🔍 Checking for incomplete surveys...");
      const existingSurvey = await surveyService.findIncompleteSurveyByEmail(email.trim());

      if (existingSurvey) {
        console.log("📋 Found incomplete survey:", existingSurvey.id);
        setIncompleteSurvey(existingSurvey);
        setShowContinueDialog(true);
        setIsLoading(false);
        return;
      }

      // Create new survey if no incomplete one found
      await createNewSurvey();
    } catch (error) {
      console.error("❌ Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error. Intente nuevamente."
      });
      setIsLoading(false);
    }
  };

  const createNewSurvey = async () => {
    try {
      console.log("🚀 Creating new survey...");
      const survey = await surveyService.createSurvey({ name: name.trim(), email: email.trim() });
      console.log("✅ Survey created:", survey);

      // Save to localStorage
      localStorage.setItem("currentSurveyId", survey.id);
      localStorage.setItem("surveyEmail", email.trim());
      localStorage.setItem("surveyName", name.trim());

      toast({
        title: "¡Listo para comenzar!",
        description: "Iniciando encuesta de diagnóstico..."
      });

      // Navigate to survey page
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Error creating survey:", error);
      throw error;
    }
  };

  const handleContinueExisting = () => {
    if (!incompleteSurvey) return;

    console.log("✅ Continuing existing survey:", incompleteSurvey.id);

    // Save to localStorage
    localStorage.setItem("currentSurveyId", incompleteSurvey.id);
    localStorage.setItem("surveyEmail", email.trim());
    localStorage.setItem("surveyName", name.trim());

    toast({
      title: "¡Continuando encuesta!",
      description: "Retomando donde lo dejaste..."
    });

    window.location.href = "/";
  };

  const handleStartNew = async () => {
    setShowContinueDialog(false);
    setIsLoading(true);
    await createNewSurvey();
  };

  return (
    <>
      <SEO 
        title="Iniciar Encuesta - Diagnóstico ERP UNICCO"
        description="Complete la encuesta de diagnóstico para evaluar la madurez de su operación financiera"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-center">
              Encuesta de Diagnóstico ERP
            </CardTitle>
            <CardDescription className="text-center text-base">
              Evaluación de madurez operativa y financiera para UNICCO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Verificando..."
                ) : (
                  <>
                    Iniciar Encuesta
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Tiempo estimado: 15-20 minutos
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encuesta incompleta encontrada</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos una encuesta que comenzaste anteriormente con este correo electrónico.
              ¿Deseas continuar donde lo dejaste o empezar una nueva encuesta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNew} disabled={isLoading}>
              Empezar Nueva
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueExisting} disabled={isLoading}>
              Continuar Encuesta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}