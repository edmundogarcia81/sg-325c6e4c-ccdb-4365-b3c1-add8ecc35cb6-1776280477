import { useEffect } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, Mail, BarChart3, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        title="¡Gracias por completar la encuesta!"
        description="Su diagnóstico de madurez ERP ha sido enviado exitosamente"
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              ¡Encuesta completada!
            </h1>
            <p className="text-lg text-muted-foreground">
              Gracias por completar el diagnóstico de madurez ERP
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      Revise su correo electrónico
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hemos enviado un resumen completo de sus respuestas a su correo electrónico. 
                      El email incluye una liga especial para revisar las estadísticas en cualquier momento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-accent/5 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      Análisis de resultados
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Su diagnóstico ayudará a identificar áreas de oportunidad y construir una propuesta 
                      de implementación SAP Business One personalizada para UNICCO.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => router.push("/start")}
                  className="w-full"
                  size="lg"
                >
                  Nueva Encuesta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Si no recibe el correo en los próximos minutos, revise su carpeta de spam
          </p>
        </div>
      </div>
    </>
  );
}