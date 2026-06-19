import nodemailer from "nodemailer";

import { config } from "../../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.port === 465,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.mail.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};
