import {sanitizeUrl} from '@braintree/sanitize-url';
import MaterialLink from '@mui/material/Link';
import type {Theme} from '@mui/material/styles';
import NextLink from 'next/link';
import React from 'react';
import type {CSSObject} from 'tss-react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => {
  // Destructuring and omitting the problematic properties
  const {'@font-face': fontFace, ...body1} = theme.typography.body1;

  return {
    link: {
      ...body1,
      fontFace,
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightMedium,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    } as CSSObject, // Ensuring the type compatibility "typography.body1" from @mui with "CSSObject"
    inherit: {
      fontSize: 'inherit',
    },
  };
});

interface NextProps {
  as?: string;
  href?: string;
  prefetch?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
  className?: string;
  target?: string;
  rel?: string;
  locale?: string;
}

const NextComposed = React.forwardRef(function NextComposed(
  props: NextProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any,
) {
  const {as, href, prefetch = false, children, locale, ...other} = props; // prefetch is set to false intentionally to avoid sending an additional chunk request on page load
  return (
    <NextLink
      href={sanitizeUrl(href)}
      prefetch={prefetch}
      as={as}
      locale={locale}
    >
      <a ref={ref} {...other}>
        {children}
      </a>
    </NextLink>
  );
});

type LinkProps = {
  to: string;
  href?: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef: any;
  activeClassName?: string;
  inherit?: boolean;
};

const Link: React.FunctionComponent<LinkProps> = ({
  activeClassName = 'active',
  to,
  href,
  className,
  external,
  innerRef,
  children,
  inherit,
  ...rest
}) => {
  const {classes, cx} = useStyles();
  const classList = cx(classes.link, className, {
    [classes.inherit]: inherit,
  });
  return external ? (
    <MaterialLink
      href={sanitizeUrl(to || href)}
      className={classList}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </MaterialLink>
  ) : (
    <MaterialLink
      component={NextComposed}
      href={sanitizeUrl(to || href)}
      className={classList}
      {...rest}
    >
      {children}
    </MaterialLink>
  );
};

const RouterLink = Link;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default React.forwardRef((props: any, ref: any) => (
  <RouterLink {...props} innerRef={ref} />
));
