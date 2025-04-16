import get from 'lodash/get';

declare global {
  interface Window {
    opera: unknown;
    MSStream: unknown;
  }
}

export enum MobileOS {
  WinPhone = 'Windows Phone',
  Android = 'Android',
  Ios = 'iOS',
  Unknown = 'unknown',
}

export enum Platform {
  Desktop = 'desktop',
  Tablet = 'tablet',
}

export type Device = MobileOS | Platform;

export default function getDevice(): Device {
  const ua = get(globalThis, 'window.navigator.userAgent');
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return Platform.Tablet;
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    )
  ) {
    return getMobileOperatingSystem();
  }
  return Platform.Desktop;
}

export const isChromeExtensionSupported = (): boolean => {
  const ua = get(globalThis, 'window.navigator.userAgent');
  return /Chrome/.test(ua);
};

export function getMobileOperatingSystem(): MobileOS {
  const userAgent = get(globalThis, 'window.navigator.userAgent');

  if (!userAgent) {
    // Possibly Opera, which in older versions had a window.opera object, before they switched to Chromium
    // In any case, we do return MobileOS.Unknown for Opera anyway, so we do not need to check explicitly.
    return MobileOS.Unknown;
  }

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return MobileOS.WinPhone;
  }

  if (/android/i.test(userAgent)) {
    return MobileOS.Android;
  }

  if (/ipad|iphone|ipod/i.test(userAgent) && !window.MSStream) {
    return MobileOS.Ios;
  }

  return MobileOS.Unknown;
}

/**
 * Dapp browser vendor, such as MetaMask, Trust Wallet, etc.
 */
export enum DappBrowserVendor {
  MetaMask = 'MetaMask',
  Unknown = 'unknown',
}

/**
 * @returns Dapp browser vendor, such as MetaMask, Trust Wallet, etc.
 */
export function getDappBrowserVendor(): DappBrowserVendor {
  const userAgent = get(globalThis, 'window.navigator.userAgent');
  const isMetaMask = get(globalThis, 'ethereum.isMetaMask');

  if (isMetaMask && /MetaMask/i.test(userAgent)) {
    return DappBrowserVendor.MetaMask;
  }

  return DappBrowserVendor.Unknown;
}

/**
 * Determines if the current browser is a MetaMask dapp browser.
 * It is recommended to use native MetaMask provider in this case.
 */
export function isMetamaskDappBrowser(): boolean {
  const dappBrowserVendor = getDappBrowserVendor();
  return dappBrowserVendor === DappBrowserVendor.MetaMask;
}
