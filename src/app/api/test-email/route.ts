import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function GET() {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Teste de Envio de Email",
      html: `
        <h1>Teste de Envio</h1>
        <p>Se você está vendo esta mensagem, o envio de emails está funcionando corretamente!</p>
        <p>Data e hora do envio: ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email de teste enviado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao enviar email de teste:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao enviar email de teste",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
