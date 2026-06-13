import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly transporter: Transporter | null
  private readonly from: string

  constructor(private readonly config: ConfigService) {
    this.from =
      this.config.get<string>('SMTP_FROM') ?? 'meetbud <no-reply@meetbud.local>'
    const host = this.config.get<string>('SMTP_HOST')
    if (host) {
      const user = this.config.get<string>('SMTP_USER')
      const pass = this.config.get<string>('SMTP_PASS')
      this.transporter = createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') ?? '1025'),
        secure: false,
        auth: user && pass ? { user, pass } : undefined,
      })
    } else {
      this.transporter = null
    }
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[mail:console] to=${to} subject="${subject}"\n${text}`)
      return
    }
    await this.transporter.sendMail({ from: this.from, to, subject, text })
  }

  sendLoginCode(to: string, code: string): Promise<void> {
    return this.send(
      to,
      'Your meetbud login code',
      `Your meetbud login code is ${code}.\nIt expires in 10 minutes. If you didn't request it, ignore this email.`,
    )
  }

  sendInvite(to: string): Promise<void> {
    return this.send(
      to,
      "You've been invited to meetbud",
      `You've been invited to meetbud.\nSign in at http://localhost:5173/login using this email address to get started.`,
    )
  }
}
