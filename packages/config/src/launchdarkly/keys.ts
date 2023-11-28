export type LaunchDarklyBooleanKey =
  | 'ecommerce-service-users-enable-chat'
  | 'ecommerce-service-users-enable-chat-community'
  | 'ecommerce-service-users-enable-chat-community-media'
  | 'ecommerce-service-users-enable-chat-support-bubble'
  | 'ecommerce-service-users-public-profile-address-verified-check'
  | 'ud-me-service-domains-enable-management';

export type LaunchDarklyNumberKey = 'example-number';

export type LaunchDarklyStringKey = 'example-string';

export type LaunchDarklyJsonKey = 'ecommerce-service-wallets-disable-badges';

export type LaunchDarklyKey =
  | LaunchDarklyBooleanKey
  | LaunchDarklyNumberKey
  | LaunchDarklyStringKey
  | LaunchDarklyJsonKey;
