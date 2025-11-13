// src/services/api/emailService.js

const EMAIL_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export async function enviarCodigoPorEmail({ to, nome, codigo }) {
  if (!to) {
    throw new Error("E-mail do destinatário é obrigatório.");
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      "[EmailService] Variáveis do EmailJS não configuradas. Utilizando envio mock."
    );
    await enviarMock({ to, nome, codigo });
    return;
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: to,
      to_name: nome || "Colaborador",
      codigo,
    },
  };

  try {
    const response = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Falha ao enviar e-mail");
    }
  } catch (error) {
    console.error("[EmailService] Falha no envio real, usando mock:", error);
    await enviarMock({ to, nome, codigo });
  }
}

async function enviarMock({ to, nome, codigo }) {
  console.info(
    `[EmailMock] Código ${codigo} enviado para ${nome || "Colaborador"} <${to}>`
  );
  return new Promise((resolve) => setTimeout(resolve, 300));
}
