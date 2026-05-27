export interface EmailMailer {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html: string;
  template?: string;
  context?: {
    name: string;
  };
}
