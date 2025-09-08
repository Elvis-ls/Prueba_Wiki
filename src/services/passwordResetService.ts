import { randomUUID } from 'crypto';
import { transporter } from '../util/mailer';

interface SendResetLinkParams {
  email: string;
  displayName: string;
  saveToken: (token: string, expiresAt: Date) => Promise<void>;
}

export const sendPasswordResetEmail = async ({ email, displayName, saveToken }: SendResetLinkParams) => {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await saveToken(token, expiresAt);

  const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
  const resetLink = `${frontendURL}/auth/changePassword?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `
      <p>Hola ${displayName},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetLink}">Haz clic aquí para restablecerla</a>.</p>
      <p>Este enlace expirará en 30 minutos.</p>
    `
  });
};