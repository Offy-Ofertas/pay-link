// src/services/api/emailService.js
import emailjs from "@emailjs/browser";

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

  const templateParams = {
    email: to,
    passcode: codigo,
    name: nome || "Colaborador",
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
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

export async function enviarLinkAssinaturaEmail({
  to,
  nome,
  link,
  assunto = "Solicitação recebida, para dar continuidade, acesse o link abaixo para autenticar e assinar o documento",
}) {
  if (!to) {
    throw new Error("E-mail do destinatário é obrigatório.");
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = "template_nlnp763";
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      "[EmailService] Variáveis do EmailJS não configuradas. Utilizando envio mock."
    );
    await enviarAssinaturaMock({ to, nome, link, assunto });
    return;
  }

  const templateParams = {
    email: to,
    name: nome || "Colaborador",
    content_link_ass: link,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
  } catch (error) {
    console.error("[EmailService] Falha no envio real, usando mock:", error);
    await enviarAssinaturaMock({ to, nome, link, assunto });
  }
}

async function enviarAssinaturaMock({ to, nome, link, assunto }) {
  console.info(
    `[EmailMock] ${assunto} para ${nome || "Colaborador"} <${to}>: ${link}`
  );
  return new Promise((resolve) => setTimeout(resolve, 300));
}
