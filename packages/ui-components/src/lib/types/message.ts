export type ConsentPreferences = {
  accepted_topics: string[];
  blocked_topics: string[];
};

export type DomainNotificationConfiguration = {
  settingsKey: string;
};

export enum DomainNotificationSettingsKey {
  NOTIFICATIONS = 'NOTIFICATIONS',
  NEWSLETTER = 'NEWSLETTER',
  MARKETING = 'MARKETING',
  SECURITY_ALERTS = 'SECURITY_ALERTS',
  AWARENESS = 'AWARENESS',
  MESSAGING_DOMAIN_OWNERS = 'MESSAGING_DOMAIN_OWNERS',
  MESSAGING_DAPPS = 'MESSAGING_DAPPS',
  MOBILE_PUSH_NOTIFICATION = 'MOBILE_PUSH_NOTIFICATION',
  TEXT_NOTIFICATION = 'TEXT_NOTIFICATION',
  WEB_NOTIFICATION = 'WEB_NOTIFICATION',
  PARTNER = 'PARTNER',
}

export type MessageParams = {
  badgeCode: string;
  subject: string;
  message: string;
  ctaUrl?: string;
  imageUrl?: string;
  sender: {
    domain: string;
  };
};

export type SendMessageParams = {
  body: MessageParams;
  signature: string;
  expiry: string;
  domain: string;
};
