import type {
  LaunchDarklyBooleanKey,
  LaunchDarklyJsonKey,
  LaunchDarklyNumberKey,
  LaunchDarklyStringKey,
} from './keys';

export interface LaunchDarklyFlagSet
  extends Record<LaunchDarklyBooleanKey, boolean>,
    Record<LaunchDarklyNumberKey, number>,
    Record<LaunchDarklyStringKey, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<LaunchDarklyJsonKey, any> {}

export type KebabToCamelCase<S extends string> =
  S extends `${infer T}-${infer U}`
    ? `${Lowercase<T>}${Capitalize<KebabToCamelCase<U>>}`
    : S;

export interface LaunchDarklyCamelFlagSet
  extends Record<KebabToCamelCase<LaunchDarklyBooleanKey>, boolean>,
    Record<KebabToCamelCase<LaunchDarklyNumberKey>, number>,
    Record<KebabToCamelCase<LaunchDarklyStringKey>, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<KebabToCamelCase<LaunchDarklyJsonKey>, any> {}

export type LaunchDarklyUserType = 'domain' | 'uid' | 'email' | 'anonymous';

export interface LaunchDarklyUserCustomAttributes {
  type: LaunchDarklyUserType;
  id?: string;
  [key: string]:
    | string
    | number
    | boolean
    | Array<string | number | boolean>
    | undefined;
}
