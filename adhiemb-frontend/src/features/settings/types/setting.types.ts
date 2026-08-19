export interface SystemSetting {
  id?: number | string;
  key: string;
  value: string;
  group: 'GENERAL' | 'COMMERCE' | 'PAYMENT' | 'SMTP';
  description?: string;
  isPublic?: boolean;
}

export type UpdateSettingData = Record<string, string | number | boolean>;

export interface GeneralSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
}

export interface CommerceSettings {
  designerCommissionPercent: number;
  minPayoutAmount: number;
  allowedFileFormats: string; // e.g. "DST,EMB,PES,JEF,EXP,VP3,XXX,HUS"
  taxPercentage: number;
}

export interface PaymentGatewaySettings {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
}

export interface SmtpSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
  enableTls: boolean;
}
