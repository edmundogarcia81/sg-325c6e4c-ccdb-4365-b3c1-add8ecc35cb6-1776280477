import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";
import { CardDescription } from "@/components/ui/card";
import { useSurvey } from "@/contexts/SurveyContext";
import Image from "next/image";

export default function StartSurvey() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "" });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor ingrese un correo electrónico válido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const survey = await surveyService.createSurvey({ name: name.trim(), email: email.trim() });

      localStorage.setItem("currentSurveyId", survey.id);
      localStorage.setItem("surveyEmail", email.trim());
      localStorage.setItem("surveyName", name.trim());

      toast({
        title: "¡Listo para comenzar!",
        description: "Iniciando encuesta de diagnóstico..."
      });

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
        title="Diagnóstico ERP - UNICCO"
        description="Evaluación de madurez operativa y financiera" />
      
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo B11 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-2xl shadow-md p-6 mb-6">
              <Image 
                src="/b11.jpg"
                alt="B11 Logo"
                width={160}
                height={60}
                priority
                className="mx-auto"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Datos de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className={`pl-10 h-12 text-base ${errors.name ? "border-destructive" : ""}`}
                      required
                      disabled={isLoading} />
                    
                  </div>
                  {errors.name &&
                  <p className="text-sm text-destructive">{errors.name}</p>
                  }
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Correo electrónico <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@unicco.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`pl-10 h-12 text-base ${errors.email ? "border-destructive" : ""}`}
                      required
                      disabled={isLoading} />
                    
                  </div>
                  {errors.email &&
                  <p className="text-sm text-destructive">{errors.email}</p>
                  }
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={isLoading}>
                  
                  {isLoading ?
                  <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Iniciando...
                    </> :

                  <>
                      Iniciar Encuesta
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>);

}