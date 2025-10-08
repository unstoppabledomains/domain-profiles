const WALLET_PASSWORD_MIN_LENGTH = 12;
const WALLET_PASSWORD_MAX_LENGTH = 32;
const WALLET_PASSWORD_NUMBER_VALIDATION_REGEX = /\d/;
const WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX =
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

export const isValidWalletPasswordFormat = (password: string): boolean => {
  return (
    password.length >= WALLET_PASSWORD_MIN_LENGTH &&
    password.length < WALLET_PASSWORD_MAX_LENGTH &&
    WALLET_PASSWORD_NUMBER_VALIDATION_REGEX.test(password) &&
    WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX.test(password)
  );
};
