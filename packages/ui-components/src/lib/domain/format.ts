import type {DomainDescription, DomainSuffixes} from '../../lib/types/domain';
import {
  EXTERNAL_DOMAIN_SUFFIXES,
  MANAGEABLE_DOMAIN_LABEL,
} from '../../lib/types/domain';

export const isExternalDomainSuffixValid = (extension: string): boolean => {
  return EXTERNAL_DOMAIN_SUFFIXES.includes(extension);
};

export const isExternalDomainValidForManagement = (domain: string): boolean => {
  return isExternalDomainValid(domain, MANAGEABLE_DOMAIN_LABEL, true);
};

const isExternalDomainValid = (
  domain: string,
  labelValidationRegex: RegExp,
  allowIdn: boolean,
): boolean => {
  if (!isDomainFormatValid(domain, labelValidationRegex, allowIdn)) {
    return false;
  }

  const {label, extension} = splitDomain(domain);
  return Boolean(label) && isExternalDomainSuffixValid(extension);
};

/**
 * IDN (Internationalized domain name) labels are not supported yet
 */
export const isInternationalDomainLabel = (label: string): boolean =>
  label.startsWith('xn--');

const isDomainFormatValid = (
  domain: string,
  labelValidationRegex: RegExp,
  allowIdn: boolean,
): boolean => {
  if (!domain) {
    return false;
  }
  let parts: string[] = [domain];
  if (domain.includes('.')) {
    parts = domain.split('.');
  }

  return parts.every((part, idx) => {
    if (idx === 0) {
      // left-most: label
      return isDomainLabelValid(part, labelValidationRegex, allowIdn);
    } else {
      return isDomainLabelValid(part, MANAGEABLE_DOMAIN_LABEL, allowIdn);
    }
  });
};

const isDomainLabelValid = (
  label: string,
  labelValidationRegex: RegExp,
  allowIdn: boolean = false,
): boolean => {
  if (!allowIdn && isInternationalDomainLabel(label)) {
    return false;
  }

  return new RegExp(labelValidationRegex).test(label);
};

export const splitDomain = (domain: string): DomainDescription => {
  const splitted = domain.split('.');
  const extension = splitted.pop()!;
  const label = splitted.shift()!;
  return {
    name: domain,
    label,
    extension: extension as DomainSuffixes,
    sld: splitted.length ? splitted.join('.') : null,
  };
};
