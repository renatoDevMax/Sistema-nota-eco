interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

export const sendEmail = async (data: EmailData): Promise<string> => {
  try {
    if (!data.to || !data.to.includes("@")) {
      throw new Error("Email de destino inválido");
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Erro ao enviar email");
    }

    return "Email enviado com sucesso!";
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Erro ao enviar email. Por favor, tente novamente.");
  }
};
