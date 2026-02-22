import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM', '"Coaching App" <noreply@coaching.app>'),
        ...options,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    }
  }

  async sendCheckinReminder(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Tijd voor je dagelijkse check-in!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Goedemorgen, ${name}! 👋</h2>
          <p style="color: #374151; font-size: 16px;">
            Het is tijd voor je dagelijkse check-in. Hoe voel je je vandaag?
          </p>
          <a href="${this.config.get('APP_URL', 'http://localhost:4200')}/checkin"
             style="display: inline-block; background-color: #6366f1; color: white;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;
                    font-size: 16px; margin: 16px 0;">
            Start Check-in
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Je ontvangt deze email omdat je dagelijkse herinneringen hebt ingeschakeld.
          </p>
        </div>
      `,
    });
  }

  async sendWeeklyReport(to: string, name: string, report: any): Promise<void> {
    const avgMood = report.averageMood?.toFixed(1) ?? 'N/A';
    const avgEnergy = report.averageEnergy?.toFixed(1) ?? 'N/A';
    const checkInCount = report.checkInCount ?? 0;

    await this.sendEmail({
      to,
      subject: `Jouw wekelijkse coaching rapport`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Jouw wekelijkse rapport, ${name}!</h2>
          <p style="color: #374151;">Hier is een overzicht van jouw week:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <div style="display: flex; justify-content: space-around; text-align: center;">
              <div>
                <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${avgMood}</div>
                <div style="color: #6b7280; font-size: 14px;">Gem. stemming</div>
              </div>
              <div>
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">${avgEnergy}</div>
                <div style="color: #6b7280; font-size: 14px;">Gem. energie</div>
              </div>
              <div>
                <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${checkInCount}</div>
                <div style="color: #6b7280; font-size: 14px;">Check-ins</div>
              </div>
            </div>
          </div>

          ${report.summary ? `<p style="color: #374151;">${report.summary}</p>` : ''}

          <a href="${this.config.get('APP_URL', 'http://localhost:4200')}/dashboard"
             style="display: inline-block; background-color: #6366f1; color: white;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;
                    font-size: 16px; margin: 16px 0;">
            Bekijk Dashboard
          </a>
        </div>
      `,
    });
  }
}
