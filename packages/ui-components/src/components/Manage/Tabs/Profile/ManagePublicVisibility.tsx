import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

import type {
  DomainProfileVisibilityValues,
  SocialProfileVisibilityValues,
} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import useStyles from '../../../../styles/components/profile.styles';

interface ManageInputProps {
  id: string;
  value?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  deprecated?: boolean;
  multiline?: boolean;
  helperText?: string;
  labelIcon?: React.ReactNode;
  disableTextTrimming?: boolean;
  flag?: string;
  // if true, the label and input will be stacked. else, the label will be to the left of the input
  stacked?: boolean;
  // number of rows to display when the `multiline` prop is set to true.
  rows?: number;
  // maximum number of characters allowed in the input element
  maxLength?: number;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  classes?: {
    root?: string;
    input?: string;
    adornedStart?: string;
    adornedEnd?: string;
  };
  endAdornmentVisible?: boolean;
  publicVisibilityValues: DomainProfileVisibilityValues;
  socialVisibilityValues?: SocialProfileVisibilityValues;
  isMixed?: boolean;
  isAllPublic?: boolean;
  isAllPrivate?: boolean;
  showCard?: boolean;
  showSocialCard?: boolean;
  handleGlobalPublicPrivateVisibility: (
    e: {
      currentTarget: {id: string};
    },
    flag?: string,
  ) => void;
  handlePublicVisibilityChange?: (id: string) => void;
  setPublicVisibilityValues?: React.Dispatch<
    React.SetStateAction<DomainProfileVisibilityValues>
  > | null;
  setCardVisibility?: React.Dispatch<React.SetStateAction<boolean>>;
  setSocialCardVisibility?: React.Dispatch<React.SetStateAction<boolean>>;
  setPrivateVisibilityFlagGlobal?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setSocialPrivateVisibilityFlagGlobal?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const ManagePublicVisibility: React.FC<ManageInputProps> = ({
  classes: classesOverride,
  publicVisibilityValues,
  socialVisibilityValues,
  handleGlobalPublicPrivateVisibility,
  showCard,
  showSocialCard,
  setCardVisibility,
  setSocialCardVisibility,
  setPrivateVisibilityFlagGlobal,
  setSocialPrivateVisibilityFlagGlobal,
  flag,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [isAllPublic, setAllVisibilityFlag] = useState<boolean>(false);
  const [isAllPrivate, setPrivateVisibilityFlag] = useState<boolean>(false);
  const [isMixed, setIsMixedFlag] = useState<boolean>(false);
  const [isSocialAllPublic, setAllSocialVisibilityFlag] =
    useState<boolean>(false);
  const [isSocialAllPrivate, setAllSocialPrivateVisibilityFlag] =
    useState<boolean>(false);
  const [isSocialMixed, setIsAllSocialMixedFlag] = useState<boolean>(false);

  useEffect(() => {
    if (publicVisibilityValues && setPrivateVisibilityFlagGlobal) {
      const allPublic: boolean =
        publicVisibilityValues.displayNamePublic! &&
        publicVisibilityValues.descriptionPublic! &&
        publicVisibilityValues.web2UrlPublic! &&
        publicVisibilityValues.locationPublic!;
      const allPrivate: boolean =
        !publicVisibilityValues.displayNamePublic &&
        !publicVisibilityValues.descriptionPublic &&
        !publicVisibilityValues.web2UrlPublic &&
        !publicVisibilityValues.locationPublic;
      setPrivateVisibilityFlag(allPrivate);
      setPrivateVisibilityFlagGlobal(allPrivate);
      setAllVisibilityFlag(allPublic);
      setIsMixedFlag(
        allPublic === false && allPrivate === false ? true : false,
      );
    }
  }, [isAllPublic, isMixed, publicVisibilityValues]);

  useEffect(() => {
    if (socialVisibilityValues && setSocialPrivateVisibilityFlagGlobal) {
      const {
        youtubePublic,
        twitterPublic,
        discordPublic,
        telegramPublic,
        redditPublic,
      } = socialVisibilityValues;
      const allSocialPublic: boolean =
        youtubePublic! &&
        twitterPublic! &&
        discordPublic! &&
        telegramPublic! &&
        redditPublic;
      const allSocialPrivate: boolean =
        !youtubePublic &&
        !twitterPublic &&
        !discordPublic &&
        !telegramPublic &&
        !redditPublic;
      setAllSocialPrivateVisibilityFlag(allSocialPrivate);
      setSocialPrivateVisibilityFlagGlobal(allSocialPrivate);
      setAllSocialVisibilityFlag(allSocialPublic);
      setIsAllSocialMixedFlag(
        allSocialPublic === false && allSocialPrivate === false ? true : false,
      );
    }
  }, [isSocialAllPublic, isSocialMixed, socialVisibilityValues]);

  const handleCardVisibility = (e: {stopPropagation: () => void}) => {
    // Toggles visibility of the modal
    e.stopPropagation();
    if (setSocialCardVisibility) {
      setSocialCardVisibility(prev => !prev);
    } else if (setCardVisibility) {
      setCardVisibility(prev => !prev);
    }
  };

  function BasicCard() {
    const profileCard = (
      <Card className={classes.card}>
        <CardActions className={classes.cardBtnContainer}>
          <div className={classes.cardModalButtons}>
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButton}
              data-testid="private"
              id="private"
              onClick={handleGlobalPublicPrivateVisibility}
            >
              {/* Need to read for DB */}
              {isAllPrivate ? (
                <CheckIcon className={classes.checkIcon} />
              ) : (
                <VisibilityOffOutlinedIcon />
              )}
            </IconButton>
            <Typography className={classes.cardCaption}>
              {t('manage.public.allprivate')}
            </Typography>
          </div>
          <div className={`${classes.cardModalButtons} ${classes.visibleBtn}`}>
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButton}
              data-testid="public"
              id="public"
              onClick={handleGlobalPublicPrivateVisibility}
            >
              {isAllPublic ? (
                <CheckIcon className={classes.checkIcon} />
              ) : (
                <PublicOutlinedIcon />
              )}
            </IconButton>
            <Typography className={classes.cardCaption}>
              {t('manage.public.allpublic')}
            </Typography>
          </div>
        </CardActions>
      </Card>
    );

    const socialCard = (
      <Card className={classes.card}>
        <CardActions className={classes.cardBtnContainer}>
          <div className={classes.cardModalButtons}>
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButton}
              data-testid="privateSocial"
              id="privateSocial"
              onClick={e => handleGlobalPublicPrivateVisibility(e, flag)}
            >
              {/* Need to read for DB */}
              {isSocialAllPrivate ? (
                <CheckIcon className={classes.checkIcon} />
              ) : (
                <VisibilityOffOutlinedIcon />
              )}
            </IconButton>
            <Typography className={classes.cardCaption}>
              {t('manage.public.allprivate')}
            </Typography>
          </div>
          <div className={`${classes.cardModalButtons} ${classes.visibleBtn}`}>
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButton}
              data-testid="publicSocial"
              id="publicSocial"
              onClick={e => handleGlobalPublicPrivateVisibility(e, flag)}
            >
              {isSocialAllPublic ? (
                <CheckIcon className={classes.checkIcon} />
              ) : (
                <PublicOutlinedIcon />
              )}
            </IconButton>
            <Typography className={classes.cardCaption}>
              {t('manage.public.allpublic')}
            </Typography>
          </div>
        </CardActions>
      </Card>
    );
    return flag === 'social' ? socialCard : profileCard;
  }

  return (
    <div style={{position: 'relative'}}>
      {flag !== 'social' ? (
        <div>
          <Button
            variant="outlined"
            onClick={handleCardVisibility}
            className={classes.visibilityBtn}
            data-testid="globalToggle"
          >
            {isMixed ? t('manage.public.mixedvisibility') : ''}
            {isAllPrivate ? t('manage.public.allprivate') : ''}
            {isAllPublic ? t('manage.public.allpublic') : ''}
            <ExpandMoreIcon />
          </Button>
          {showCard && <BasicCard></BasicCard>}
        </div>
      ) : (
        <div>
          <Button
            variant="outlined"
            onClick={handleCardVisibility}
            className={classes.visibilityBtn}
            data-testid="globalToggleSocial"
          >
            {isSocialMixed ? t('manage.public.mixedvisibility') : ''}
            {isSocialAllPrivate ? t('manage.public.allprivate') : ''}
            {isSocialAllPublic ? t('manage.public.allpublic') : ''}
            <ExpandMoreIcon />
          </Button>
          {showSocialCard && <BasicCard></BasicCard>}
        </div>
      )}
    </div>
  );
};

export default ManagePublicVisibility;
