import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  token: string;
  responses: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, token, responses }: RequestBody = await req.json();

    // Configuración SMTP IONOS
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.ionos.mx",
        port: 587,
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USERNAME") || "",
          password: Deno.env.get("SMTP_PASSWORD") || "",
        },
      },
    });

    const surveyUrl = `${Deno.env.get("SITE_URL") || "https://your-domain.vercel.app"}/survey/${token}`;

    // Construir HTML del resumen
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen de Encuesta - Diagnóstico ERP UNICCO</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #0c4a6e 0%, #075985 100%); color: white; padding: 40px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px 24px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 20px; font-weight: 600; color: #0c4a6e; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #22c55e; }
    .question { margin-bottom: 20px; padding: 16px; background: #f1f5f9; border-radius: 8px; }
    .question-text { font-weight: 500; color: #334155; margin: 0 0 8px 0; font-size: 14px; }
    .answer { color: #0f172a; font-size: 15px; }
    .answer.not-my-role { color: #64748b; font-style: italic; }
    .cta { background: #22c55e; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; margin: 24px 0; }
    .cta:hover { background: #16a34a; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
    @media only screen and (max-width: 600px) {
      .header { padding: 24px 16px; }
      .header h1 { font-size: 24px; }
      .content { padding: 24px 16px; }
      .section-title { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Diagnóstico ERP Completado</h1>
      <p>Evaluación SAP Business One para UNICCO</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
        Gracias por completar la encuesta de diagnóstico. A continuación encontrará un resumen de sus respuestas.
      </p>

      ${Object.entries(responses).map(([categoryId, categoryData]: [string, any]) => `
        <div class="section">
          <h2 class="section-title">${categoryData.title}</h2>
          ${categoryData.questions.map((q: any) => `
            <div class="question">
              <p class="question-text">${q.text}</p>
              <p class="answer${q.isNotMyRole ? " not-my-role" : ""}">${
                q.isNotMyRole ? "No es mi rol" : q.answer || "Sin respuesta"
              }</p>
            </div>
          `).join("")}
        </div>
      `).join("")}

      <div style="text-align: center; margin: 40px 0;">
        <a href="${surveyUrl}" class="cta">
          Ver Estadísticas Detalladas →
        </a>
        <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
          Esta liga es única y personal. Puede consultarla en cualquier momento.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>Este correo fue generado automáticamente. No responder.</p>
      <p style="margin-top: 8px;">© ${new Date().getFullYear()} UNICCO - Diagnóstico de Madurez ERP</p>
    </div>
  </div>
</body>
</html>
    `;

    await client.send({
      from: Deno.env.get("SMTP_FROM_EMAIL") || "noreply@unicco.com",
      to: email,
      subject: "Resumen de su Encuesta - Diagnóstico ERP UNICCO",
      content: "Resumen de encuesta adjunto en HTML",
      html: htmlContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});