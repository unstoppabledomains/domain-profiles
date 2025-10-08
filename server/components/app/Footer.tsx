import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import {useStyles} from 'styles/pages/index.styles';

import {
  LightDarkToggle,
  useTranslationContext,
} from '@unstoppabledomains/ui-components';

const Footer: React.FC = () => {
  const {classes} = useStyles({});
  const [t] = useTranslationContext();

  return (
    <Box className={classes.footerContainer}>
      <Box className={classes.footerContent} mb={1}>
        <LightDarkToggle />
      </Box>
      <Box className={classes.footerContent}>
        <Typography className={classes.copyright} variant="body2">
          {t('footer.copyright')}
        </Typography>
      </Box>
      <Box className={classes.footerContent}>
        <Typography variant="caption">
          <a
            className={classes.footerLink}
            href="https://unstoppabledomains.com/terms"
          >
            {t('footer.terms')}
          </a>
          <a
            className={classes.footerLink}
            href="https://unstoppabledomains.com/privacy-policy"
          >
            {t('footer.privacyPolicy')}
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
