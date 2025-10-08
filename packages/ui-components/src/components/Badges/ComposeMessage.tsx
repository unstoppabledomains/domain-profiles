import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendBadgeMessage} from '../../actions/messageActions';
import {ProfileManager} from '../../components/Wallet/ProfileManager';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';

interface Props {
  badge: string;
  authWallet: string;
  authDomain: string;
  badgeCode: string;
  defaultImage: string;
  holders?: number;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  onClose(): void;
  onSuccess?(): void;
  onError?(): void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  textLimit: {
    fontSize: theme.typography.subtitle2.fontSize,
    float: 'right',
  },
  closeButton: {
    margin: theme.spacing(-1),
  },
  formField: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: 'none',
    boxShadow: theme.shadows[6],
  },
  divider: {
    margin: `${theme.spacing(1.5)} 0`,
    borderBottomStyle: 'dashed',
  },
  previewImage: {
    maxHeight: 'inherit',
    maxWidth: theme.spacing(3),
  },
}));

const ComposeMessage: React.FC<Props> = props => {
  const {
    onClose,
    authWallet,
    setWeb3Deps,
    authDomain,
    badge,
    badgeCode,
    holders,
    defaultImage,
  } = props;
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [imgUrl, setImgUrl] = useState(defaultImage);
  const [validImgUrl, setValidImgUrl] = useState(false);
  const [sendClicked, setSendClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const {handleSubmit} = useForm<{code: string}>();

  const handleCallback = async (signature: string, expiry: string) => {
    try {
      const resp = await sendBadgeMessage({
        signature,
        expiry,
        domain: authDomain,
        body: {
          badgeCode,
          subject,
          message: messageBody,
          ctaUrl,
          imageUrl: imgUrl,
          sender: {
            domain: authDomain,
          },
        },
      });

      if (resp.status >= 400) {
        enqueueSnackbar(t('common.somethingWentWrong'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          t('profile.messaging.messageSent', {
            numberOfHolders: holders || 0,
            plural: holders && holders > 1 ? 's' : '',
          }),
        );
        onClose();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      enqueueSnackbar(e.message || t('profile.messaging.failedToSend'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If valid URL then display preview in image text field
    try {
      const url = new URL(imgUrl);
      if (url) {
        setValidImgUrl(true);
      }
    } catch {
      setValidImgUrl(false);
    }
  }, [imgUrl]);

  const handleSendMessage = async () => {
    setSendClicked(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleSendMessage)}>
        <Box flexDirection="column" display="flex" padding={'24px'}>
          <Grid container justifyContent={'space-between'}>
            <Grid item>
              <Typography variant="h5" mb={2}>
                {t('profile.messaging.compose')}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={onClose}
                aria-label={t('common.close')}
                size="large"
                className={classes.closeButton}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Paper className={classes.paper}>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems={'center'}
              sx={{
                mb: '8px',
              }}
            >
              <Typography variant="body1" align="left">
                {t('profile.messaging.from')}
              </Typography>
              <Chip variant="outlined" label={authDomain} />
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems={'center'}
              sx={{
                mb: '24px',
              }}
            >
              <Typography variant="body1" align="left">
                {t('profile.messaging.to')}
              </Typography>
              <Chip
                variant="outlined"
                label={`${holders} ${badge} ${t('profile.messaging.holders')}`}
              />
            </Stack>
            <div className={classes.formField}>
              <TextField
                id="msgSubject"
                label={t('profile.messaging.subject')}
                onChange={e => setSubject(e.target.value)}
                value={subject}
                placeholder={t('profile.messaging.enterSubject')}
                InputLabelProps={{shrink: true}}
                required
                inputProps={{maxLength: 80}}
                fullWidth
                size="small"
              />
              <div className={classes.textLimit}>{`${subject.length}/80`}</div>
            </div>
            <div className={classes.formField}>
              <TextField
                id="msgBody"
                label={t('profile.messaging.message')}
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                placeholder={t('profile.messaging.enterMessage')}
                required
                InputLabelProps={{shrink: true}}
                multiline
                minRows={5}
                maxRows={6}
                inputProps={{maxLength: 500}}
                fullWidth
                size="small"
              />
              <div
                className={classes.textLimit}
              >{`${messageBody.length}/500`}</div>
            </div>

            <Divider className={classes.divider}></Divider>
            <TextField
              id="imageUrl"
              label={t('profile.messaging.imageUrl')}
              onChange={e => setImgUrl(e.target.value)}
              value={imgUrl}
              placeholder="https://example.com/image.jpeg"
              InputLabelProps={{shrink: true}}
              fullWidth
              helperText={t('profile.messaging.imageUrlDescription')}
              size="small"
              InputProps={{
                startAdornment: validImgUrl && (
                  <InputAdornment position="start">
                    <img src={imgUrl} className={classes.previewImage} />
                  </InputAdornment>
                ),
              }}
            />
            <Divider className={classes.divider}></Divider>
            <TextField
              id="msgCTA"
              label={t('profile.messaging.ctaUrl')}
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="https://example.com"
              helperText={t('profile.messaging.ctaDescription')}
              InputLabelProps={{shrink: true}}
              fullWidth
              size="small"
            />
            <Stack direction="row" alignItems="center" mt="24px" spacing={1}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={loading}
              >
                {t('profile.messaging.sendMessage')}
              </Button>
              {loading && <CircularProgress size={32} />}
            </Stack>
          </Paper>
        </Box>
      </form>
      <ProfileManager
        domain={authDomain}
        ownerAddress={authWallet}
        setWeb3Deps={setWeb3Deps}
        saveClicked={sendClicked}
        setSaveClicked={setSendClicked}
        onSignature={handleCallback}
      />
    </>
  );
};

export default ComposeMessage;
