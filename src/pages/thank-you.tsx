import { useEffect } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, Mail, BarChart3, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurvey } from "@/contexts/SurveyContext";
import Image from "next/image";

export default function ThankYou() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar localStorage después de completar
    const timer = setTimeout(() => {
      localStorage.removeItem("surveyState");
      localStorage.removeItem("currentSurveyId");
      localStorage.removeItem("surveyEmail");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title="¡Gracias! - Encuesta Completada"
        description="Tu encuesta ha sido enviada exitosamente"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-2">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">
              ¡Encuesta completada!
            </CardTitle>
            <CardDescription className="text-base">
              Gracias por completar el diagnóstico de madurez ERP
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Análisis de resultados</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Su diagnóstico ayudará a identificar áreas de oportunidad y construir una 
                    propuesta de implementación SAP Business One personalizada para UNICCO.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => router.push("/start")}
                size="lg"
                className="min-w-[200px]"
              >
                Nueva Encuesta
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}