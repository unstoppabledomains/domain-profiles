import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getMarketplaceBadgeDetails} from '../../actions/badgeActions';
import {notifyError} from '../../lib/error';
import useTranslationContext from '../../lib/i18n';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    '& .MuiDialogContent-root': {
      backgroundColor: '#fff',
      width: '420px',
    },
  },

  button: {
    marginTop: theme.spacing(2),
    width: '100%',
  },

  icon: {
    marginRight: theme.spacing(1),
    fontSize: 22,
  },

  headerPhoto: {
    width: '100%',
    resizeImage: 'cover',
    padding: 0,
  },

  content: {
    display: 'flex',
    justifyContent: 'center',
    flexFlow: 'column',
    paddingTop: 0,
  },

  title: {
    textAlign: 'center',
  },

  text: {
    textAlign: 'center',
    color: theme.palette.neutralShades[600],
    fontSize: '16px',
  },

  continue: {
    marginTop: 16,
    justifyContent: 'center',
  },

  textField: {
    marginTop: 20,
    marginBottom: 8,
  },

  badgePreviewContainer: {
    marginTop: 16,
    background: '#FFFFFF',
    boxShadow:
      '0px 1px 0px #DDDDDF, 0px 0px 0px 1px #DDDDDF, 0px 8px 24px rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    width: '254px',
    height: '72px',
    display: 'flex',
    alignSelf: 'center',
    padding: 16,
  },

  badgeTitle: {
    marginLeft: 16,
    alignSelf: 'center',
  },

  error: {
    marginTop: 8,
    display: 'flex',
    justifyContent: 'center',
  },

  errorIcon: {
    marginRight: 4,
  },

  progressBarContainer: {
    display: 'flex',
    flex: '1',
    flexFlow: 'column',
  },

  firstProgressBar: {
    color: 'lightgrey',
    width: '65%',
    height: 16,
    borderRadius: 25,
    marginLeft: 14,
    marginTop: 2,
  },

  secondProgressBar: {
    color: 'lightgrey',
    width: '45%',
    height: 8,
    borderRadius: 25,
    marginLeft: 14,
    marginTop: 8,
  },

  badgeExistsText: {
    marginTop: 24,
    color: '#62626A',
    textAlign: 'center',
  },
}));

interface Props {
  open: boolean;
  handleClose: () => void;
}

const CustomBadgesDialog: React.FC<Props> = ({open, handleClose}) => {
  const [t] = useTranslationContext();
  const {cx, classes} = useStyles();

  const [isLoading, setLoading] = useState<boolean>(false);

  const [marketplaceUrlDialogOnDisplay, setMarketplaceUrlDialogOnDisplay] =
    useState<boolean>(false);

  const [collectionUrl, setCollectionUrl] = useState('');
  const [error, setError] = useState({
    error: false,
    message: '',
    disableButton: true,
    exists: false,
  });

  const [badgeDetails, setBadgeDetails] = useState({
    logo: '',
    name: '',
    preview: false,
    code: null,
  });

  const handleContinue = () => {
    handleClose();
    setMarketplaceUrlDialogOnDisplay(true);
  };

  const handleSecondDialogClose = () => {
    //clear out form and previews
    setMarketplaceUrlDialogOnDisplay(false);
    setCollectionUrl('');
    setBadgeDetails({...badgeDetails, preview: false});
    setError({error: false, message: '', disableButton: false, exists: false});
  };

  useEffect(() => {
    void (async () => {
      if (collectionUrl !== '') {
        try {
          setLoading(true);
          const resp = await getMarketplaceBadgeDetails(collectionUrl);
          setLoading(false);

          if (resp) {
            setBadgeDetails({
              ...badgeDetails,
              logo: resp.logo,
              name: resp.name,
              preview: true,
              code: resp.code,
            });

            //clear any errors  from previous searches
            setError({
              error: false,
              message: '',
              disableButton: false,
              exists: false,
            });
          } else {
            setError({
              ...error,
              error: true,
              message: t('badges.invalid'),
              disableButton: true,
            });
            setBadgeDetails({
              ...badgeDetails,
              preview: false,
            });
          }
        } catch (e) {
          notifyError(e);
          return e;
        }
      }
      return;
    })();
  }, [collectionUrl]);

  const BadgePreview = () => {
    return (
      <div
        data-testid={'badge-preview'}
        key={'badge-preview'}
        className={classes.badgePreviewContainer}
      >
        <Avatar src={badgeDetails.logo} />
        <Typography className={classes.badgeTitle} variant={'subtitle2'}>
          {badgeDetails.name}
        </Typography>
      </div>
    );
  };

  const BadgeExists = () => {
    return (
      <div data-testid={'badge-exists'} className={classes.badgeExistsText}>
        <Typography variant="body2">
          {t('badges.badgeExists', {email: 'support@unstoppabledomains.com'})}
        </Typography>
      </div>
    );
  };

  const BadgeLoading = () => {
    return (
      <div
        key={'badge-loading'}
        data-testid={'badge-loading'}
        className={cx(classes.badgePreviewContainer, 'animated-background')}
      >
        <Avatar />
        <div className={classes.progressBarContainer}>
          <LinearProgress
            className={classes.firstProgressBar}
            color={'inherit'}
          />
          <LinearProgress
            className={classes.secondProgressBar}
            color={'inherit'}
          />
        </div>
      </div>
    );
  };

  const InitialDialog = () => {
    return (
      <>
        <Dialog
          open={open}
          maxWidth={'xs'}
          className={classes.container}
          data-testid={'custom-badge-initial-dialog'}
          key={'initial-dialog'}
        >
          <DialogContent className={classes.headerPhoto}>
            <img
              src={
                'https://storage.googleapis.com/unstoppable-client-assets/images/badges/custom-badge-dialog-header.png'
              }
              alt={'Web3 Custom Badges'}
            />
          </DialogContent>
          <DialogTitle>
            <IconButton
              aria-label="close"
              data-testid={'close-initial-dialog'}
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.content}>
            <DialogTitle className={classes.title}>
              {' '}
              {t('badges.customTitle')}
            </DialogTitle>
            <DialogContentText className={classes.text}>
              {t('badges.customDescription')}
            </DialogContentText>
            <DialogActions>
              <Button
                fullWidth
                autoFocus
                variant="contained"
                onClick={handleContinue}
                className={classes.continue}
                data-testid={'custom-badge-continue-button'}
              >
                {t('badges.continue')}
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const MarketplaceUrlDialog = () => {
    return (
      <>
        <Dialog
          open={marketplaceUrlDialogOnDisplay}
          maxWidth={'xs'}
          className={classes.container}
          data-testid={'custom-marketplace-dialog'}
          key={'marketplace-dialog'}
        >
          <DialogContent className={classes.content}>
            <DialogTitle className={classes.title}>
              {t('badges.createWithMarketplaceUrl')}
              <IconButton
                aria-label="close"
                data-testid={'close-second-dialog'}
                onClick={handleSecondDialogClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContentText className={classes.text}>
              {t('badges.marketplaceUrlDescription')}
            </DialogContentText>
            <FormGroup>
              <TextField
                inputProps={{'data-testid': 'marketplace-url-field'}}
                className={classes.textField}
                id="marketplace-url"
                placeholder="e.g. https://opensea.io/collection/collection_name"
                type="url"
                fullWidth
                defaultValue={collectionUrl}
                variant="outlined"
                helperText={
                  error?.error && (
                    <div className={classes.error}>
                      <ErrorOutlineIcon
                        className={classes.errorIcon}
                        fontSize={'small'}
                      />
                      {error.message}
                    </div>
                  )
                }
                onBlur={e => setCollectionUrl(e.target.value)}
                error={error.error}
              />
              {isLoading && <BadgeLoading />}
              {badgeDetails.preview && !isLoading && <BadgePreview />}
              {error.exists && <BadgeExists />}
              <DialogActions className={classes.continue}>
                <Button
                  data-testid="create-badge-button"
                  disabled={error.disableButton}
                  fullWidth
                  autoFocus
                  variant="contained"
                  onClick={() =>
                    (window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/badge/activate/${badgeDetails.code}`)
                  }
                >
                  {t('badges.create')}
                </Button>
              </DialogActions>
            </FormGroup>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <>
      <InitialDialog />
      <MarketplaceUrlDialog />
    </>
  );
};

export default CustomBadgesDialog;
