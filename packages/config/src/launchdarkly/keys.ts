export type LaunchDarklyBooleanKey =
  | 'ecommerce-service-users-enable-chat'
  | 'ecommerce-service-users-enable-chat-community'
  | 'ecommerce-service-users-enable-chat-community-media'
  | 'ecommerce-service-users-enable-chat-community-udBlue'
  | 'ecommerce-service-users-enable-chat-support-bubble'
  | 'ecommerce-service-users-public-profile-address-verified-check'
  | 'profile-service-enable-wallet-creation'
  | 'profile-service-enable-wallet-identity'
  | 'profile-service-enable-wallet-send-to-email'
  | 'ud-me-service-domains-enable-social-verification'
  | 'ud-me-service-domains-enable-fireblocks'
  | 'ud-me-service-domains-enable-management'
  | 'ud-me-service-enable-swap';

export type LaunchDarklyNumberKey = 'example-number';

export type LaunchDarklyStringKey = 'example-string';

export type LaunchDarklyJsonKey = 'ecommerce-service-wallets-disable-badges';

export type LaunchDarklyKey =
  | LaunchDarklyBooleanKey
  | LaunchDarklyNumberKey
  | LaunchDarklyStringKey
  | LaunchDarklyJsonKey;
