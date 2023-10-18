import Hidden from '@mui/material/Hidden';
import Link from 'components/Link';
import React from 'react';

import config from '@unstoppabledomains/config';
import {
  Logo as LogoIcon,
  LogoTheme,
} from '@unstoppabledomains/ui-kit/components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

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

type Props = {
  className?: string;
  inverse?: boolean;
  absoluteUrl?: boolean;
};

const Logo: React.FC<Props> = ({className = '', inverse, absoluteUrl}) => {
  const {classes, cx} = useStyles();
  const logoIconTheme = inverse ? LogoTheme.White : LogoTheme.Primary;

  const HomeLink: React.FC = ({children}) => {
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
