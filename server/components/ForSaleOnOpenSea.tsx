import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Link from 'components/Link';
import useTranslationContext from 'lib/i18n';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primaryShades[100],
    border: `1px solid ${theme.palette.primaryShades[200]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      flexFlow: 'column',
      alignItems: 'flex-start',
      padding: theme.spacing(2),
      marginTop: theme.spacing(0),
    },
  },
  image: {
    color: theme.palette.primary.main,
    fontSize: 32,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  content: {
    margin: theme.spacing(0, 2),
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0, 0, 2),
    },
  },
  action: {
    fontWeight: theme.typography.fontWeightBold,
  },
  divider: {
    margin: theme.spacing(6, 0),
  },
  titleBig: {
    marginBottom: theme.spacing(0.5),
  },
}));

type Props = {
  email: string;
  link: string;
};

const ForSaleOnOpenSea: React.FC<Props> = ({email, link}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  if (!link) {
    return null;
  }

  return (
    <>
      <div className={classes.root}>
        <MailOutlineIcon className={classes.image} />

        <div className={classes.content}>
          <Typography
            fontWeight="medium"
            variant="h6"
            className={classes.titleBig}
          >
            {t('profile.listedForSale')}
          </Typography>
          <Typography variant="body2" color="GrayText" component="div">
            {email && (
              <>
                {t('profile.contactSeller')}:{' '}
                <Link external inherit href={`mailto:${email}`}>
                  {email}
                </Link>
              </>
            )}
          </Typography>
        </div>

        <div>
          <Button
            variant="outlined"
            endIcon={<NorthEastIcon />}
            className={classes.action}
            href={link}
            target="_blank"
            rel="noreferrer"
          >
            {t('profile.openSea')}
          </Button>
        </div>
      </div>

      <Divider className={classes.divider} />
    </>
  );
};

export default ForSaleOnOpenSea;
