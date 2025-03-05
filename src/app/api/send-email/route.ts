import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Ativa logs detalhados
});

export async function POST(request: Request) {
  try {
    console.log("Iniciando envio de email...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);

    const { to, subject, text, html, attachments } = await request.json();
    console.log("Dados recebidos:", {
      to,
      subject,
      attachmentsCount: attachments?.length,
    });

    // Validações
    if (!to || !to.includes("@")) {
      throw new Error("Email de destino inválido");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Configurações de email não encontradas");
    }

    // Configuração do email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: subject || "Notas Fiscais",
      text: text || "",
      html: html || text?.replace(/\n/g, "<br>") || "",
      attachments: attachments || [],
    };

    // Enviar email
    console.log("Enviando email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado com sucesso:", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Erro detalhado ao enviar email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error,
      },
      { status: 500 }
    );
  }
}
