import type {LaunchDarklyFlagSet} from './types';

export const defaultFlagValues: LaunchDarklyFlagSet = {
  'ecommerce-service-users-enable-chat': true,
  'ecommerce-service-users-enable-chat-community': true,
  'ecommerce-service-users-enable-chat-community-media': false,
  'ecommerce-service-users-enable-chat-support-bubble': false,
  'ecommerce-service-users-public-profile-address-verified-check': true,
  'ecommerce-service-wallets-disable-badges': [],
  'example-number': 0,
  'example-string': '',
};

export default defaultFlagValues;
