import type {LaunchDarklyFlagSet} from './types';

export const defaultFlagValues: LaunchDarklyFlagSet = {
  'ecommerce-service-users-enable-chat': true,
  'ecommerce-service-users-enable-chat-community': true,
  'ecommerce-service-users-enable-chat-community-media': false,
  'ecommerce-service-users-enable-chat-support-bubble': false,
  'ecommerce-service-users-public-profile-address-verified-check': true,
  'profile-service-enable-wallet-creation': true,
  'profile-service-enable-wallet-identity': false,
  'profile-service-enable-wallet-send-to-email': false,
  'ud-me-service-domains-enable-social-verification': false,
  'ud-me-service-domains-enable-management': false,
  'ud-me-service-domains-enable-fireblocks': false,
  'ud-me-enable-wallet-solana-signing': false,
  'ud-me-service-enable-swap': true,
  'ecommerce-service-users-enable-chat-community-udBlue': false,
  'ecommerce-service-wallets-disable-badges': [],
  'example-number': 0,
  'example-string': '',
};

export default defaultFlagValues;
