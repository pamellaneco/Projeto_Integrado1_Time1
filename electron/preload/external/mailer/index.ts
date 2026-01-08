import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true
});

type ISendEmailProps = {
  to: string;
  subject: string;
  html: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
};

export const sendEmail = async ({ to, subject, html, attachments }: ISendEmailProps) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Erro ao enviar e-mail: ${JSON.stringify(error)}`);
  }
};
