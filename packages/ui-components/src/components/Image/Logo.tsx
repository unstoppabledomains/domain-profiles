import Hidden from '@mui/material/Hidden';
import React from 'react';

import config from '@unstoppabledomains/config';
import {
  Logo as LogoIcon,
  LogoTheme,
} from '@unstoppabledomains/ui-kit/components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import Link from '../../components/Link';

const useStyles = makeStyles()(() => ({
  logo: {
    width: 42,
    height: 42,
  },
  homeLink: {
    display: 'flex',
    cursor: 'pointer',
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
}));

type LogoProps = {
  className?: string;
  inverse?: boolean;
  absoluteUrl?: boolean;
};

type HomeLinkProps = {
  children: React.ReactNode;
};

const Logo: React.FC<LogoProps> = ({className = '', inverse, absoluteUrl}) => {
  const {classes, cx} = useStyles();
  const logoIconTheme = inverse ? LogoTheme.White : LogoTheme.Primary;

  const HomeLink: React.FC<HomeLinkProps> = ({children}) => {
    return (
      <Link
        href={config.UNSTOPPABLE_WEBSITE_URL}
        className={classes.homeLink}
        aria-label="home page"
      >
        {children}
      </Link>
    );
  };

  return (
    <HomeLink>
      <Hidden smUp>
        <LogoIcon
          className={cx(classes.logo, {[className]: !!className})}
          theme={logoIconTheme}
        />
      </Hidden>
      <Hidden smDown>
        <LogoIcon
          theme={LogoTheme.PrimaryWithText}
          className={className}
          inverse={inverse}
        />
      </Hidden>
    </HomeLink>
  );
};

export default Logo;
