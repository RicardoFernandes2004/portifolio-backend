import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

/**
 * Envio de email transacional. Hoje só o link de reset de senha, sempre para o
 * próprio admin. Falha de envio nunca vira resposta HTTP — o endpoint de
 * /forgot responde igual em qualquer caso, senão vira oráculo de enumeração.
 */
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter | null = null;

    private getTransporter(): Transporter | null {
        if (this.transporter) return this.transporter;

        const host = process.env.SMTP_HOST;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass) return null;

        const port = Number(process.env.SMTP_PORT ?? 587);
        this.transporter = createTransport({
            host,
            port,
            // 465 é TLS implícito; 587 sobe via STARTTLS.
            secure: port === 465,
            auth: { user, pass },
        });
        return this.transporter;
    }

    async sendPasswordReset(to: string, link: string): Promise<void> {
        const transporter = this.getTransporter();

        if (!transporter) {
            this.logger.error(
                'SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS); email de reset não enviado',
            );
            if (process.env.NODE_ENV !== 'production') {
                // Afordância de desenvolvimento, jamais em produção: sem isso
                // não dá para testar o fluxo sem um servidor SMTP à mão.
                this.logger.warn(`[dev] link de reset: ${link}`);
            }
            return;
        }

        await transporter.sendMail({
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
            to,
            subject: 'Redefinição de senha — RC.dev',
            text: [
                'Você pediu para redefinir a senha do painel administrativo.',
                '',
                link,
                '',
                'O link vale por 30 minutos e só pode ser usado uma vez.',
                'Se não foi você, ignore este email: a senha atual continua valendo.',
            ].join('\n'),
        });
    }
}
