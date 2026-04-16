import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("📧 Starting email send process...");
    const { email, name, token, responses } = await req.json();
    console.log("📦 Received data:", { email, name, token, responsesCount: Object.keys(responses || {}).length });

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.ionos.mx",
        port: 587,
        tls: false,
        auth: {
          username: Deno.env.get("SMTP_USERNAME")!,
          password: Deno.env.get("SMTP_PASSWORD")!,
        },
      },
    });

    console.log("🔌 SMTP client configured");

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const statsUrl = `${siteUrl}/survey/${token}`;

    console.log("📊 Stats URL:", statsUrl);

    // Generar HTML del resumen
    let responsesSummary = "";
    Object.entries(responses).forEach(([questionId, answer]: [string, any]) => {
      const displayValue = answer.isNotMyRole 
        ? "No es mi rol" 
        : answer.value || "Sin respuesta";
      
      responsesSummary += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            ${questionId}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">
            ${displayValue}
          </td>
        </tr>
      `;
    });

    console.log("📝 Response summary generated");

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0f3f6e 0%, #1e5a8e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Diagnóstico de Madurez ERP
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">
                Evaluación SAP Business One - UNICCO
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Hola <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Gracias por completar la encuesta de diagnóstico. A continuación encontrarás un resumen de tus respuestas.
              </p>

              <!-- CTA Button -->
              <div style="margin: 30px 0; text-align: center;">
                <a href="${statsUrl}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
                  Ver Estadísticas Completas →
                </a>
              </div>

              <p style="margin: 20px 0 30px; color: #6b7280; font-size: 14px; text-align: center;">
                O copia este enlace en tu navegador:<br>
                <a href="${statsUrl}" style="color: #0f3f6e; word-break: break-all;">${statsUrl}</a>
              </p>

              <!-- Responses Summary -->
              <div style="margin-top: 40px;">
                <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: 700; border-bottom: 2px solid #0f3f6e; padding-bottom: 10px;">
                  Resumen de Respuestas
                </h2>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; color: #111827; font-weight: 600; font-size: 14px; border-bottom: 2px solid #e5e7eb;">
                        Pregunta
                      </th>
                      <th style="padding: 12px; text-align: left; color: #111827; font-weight: 600; font-size: 14px; border-bottom: 2px solid #e5e7eb;">
                        Respuesta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${responsesSummary}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                © 2026 UNICCO - Diagnóstico ERP
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("📧 Sending email...");
    await client.send({
      from: Deno.env.get("SMTP_FROM_EMAIL")!,
      to: email,
      subject: `Resumen de Encuesta - Diagnóstico ERP UNICCO`,
      content: htmlBody,
      html: htmlBody,
    });

    console.log("✅ Email sent successfully");
    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});