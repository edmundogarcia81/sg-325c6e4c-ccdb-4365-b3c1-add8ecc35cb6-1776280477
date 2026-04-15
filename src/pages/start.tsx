import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

export default function StartSurvey() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor ingrese un correo electrónico válido"
      });
      return;
    }

    setIsLoading(true);

    try {
      const survey = await surveyService.createSurvey({ email });
      
      // Guardar surveyId en localStorage para el contexto
      localStorage.setItem("currentSurveyId", survey.id);
      localStorage.setItem("surveyEmail", email);
      
      toast({
        title: "¡Listo para comenzar!",
        description: "Iniciando encuesta de diagnóstico..."
      });

      // Redirigir a la encuesta
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Error creating survey:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la encuesta. Intente nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Iniciar Diagnóstico ERP - UNICCO"
        description="Comience su evaluación de madurez operativa y financiera"
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-3">
              Diagnóstico de Madurez ERP
            </h1>
            <p className="text-lg text-muted-foreground">
              Evaluación SAP Business One para UNICCO
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Comencemos</CardTitle>
              <CardDescription>
                Ingrese su correo electrónico para iniciar la encuesta. Al finalizar, recibirá un resumen completo con sus respuestas y una liga especial para revisar las estadísticas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@unicco.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este correo se usará únicamente para enviarle el resumen de su encuesta
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-foreground">La encuesta incluye:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 11 secciones de evaluación</li>
                    <li>• Preguntas sobre gestión financiera y operativa</li>
                    <li>• Opción "No es mi rol" para preguntas no aplicables</li>
                    <li>• Tiempo estimado: 15-20 minutos</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      Iniciar Encuesta
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sus datos están protegidos y serán usados únicamente para esta evaluación
          </p>
        </div>
      </div>
    </>
  );
}