import {useRouter} from 'next/router';
import type {ReactNode} from 'react';
import React, {useEffect, useState} from 'react';

import usePrevious from '../../hooks/usePrevious';
import {setCookie} from '../../lib/cookie';
import TranslationContext from './TranslationContext';
import {i18nTranslate, loadLocale, localesLoaded} from './helpers';
import type {T} from './index';
import type {AvailableLocales} from './types';
import {DEFAULT_LOCALE} from './types';

type Props = {
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TranslationProvider: any = (props: Props) => {
  const {children} = props;
  const router = useRouter();
  const [ready, setReady] = useState(true);
  const [locale, setLocale] = useState<AvailableLocales>(
    (router.locale?.toLowerCase() as AvailableLocales) || DEFAULT_LOCALE,
  );
  const prevLocale = usePrevious(locale, false);
  const t: T = (key, interpolate = {}, _locale, isLowerCase) => {
    return i18nTranslate(key, interpolate, locale, isLowerCase);
  };

  useEffect(() => {
    if (prevLocale !== locale) {
      setCookie({
        name: 'NEXT_LOCALE',
        value: locale,
        options: {
          // 1 year
          maxAge: 60 * 60 * 24 * 365,
        },
        category: 'essential',
      });
    }
  }, [locale, prevLocale, router.pathname, router.asPath]);

  // make sure preferred locale is loaded
  useEffect(() => {
    void (async () => {
      if (!localesLoaded[locale]) {
        setReady(false);
        await loadLocale(locale);
      }

      setReady(true);
    })();
  }, [locale, localesLoaded]);

  return (
    <TranslationContext.Provider value={[t, setLocale, locale]}>
      {ready ? children : null}
    </TranslationContext.Provider>
  );
};

export default TranslationProvider;
