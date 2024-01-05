import Close from '@mui/icons-material/Close';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import type {TooltipProps} from '@mui/material/Tooltip';
import Tooltip, {tooltipClasses} from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {styled} from '@mui/material/styles';
import {useRouter} from 'next/router';
import {useSnackbar} from 'notistack';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';

import ComposeMessage from '../../components/Badges/ComposeMessage';
import CopyToClipboard from '../../components/CopyToClipboard';
import {DomainPreview} from '../../components/Domain/DomainPreview';
import Link from '../../components/Link';
import useUnstoppableMessaging from '../../hooks/useUnstoppableMessaging';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';
import useStyles from '../../styles/components/badgePopupModalStyles';

const LightTooltip = styled(({className, ...props}: TooltipProps) => (
  <Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.neutralShades[600],
    boxShadow: theme.shadows[1],
  },
}));

interface Props {
  isOpenModal: boolean;
  handleShowModal: () => void;
  logo: string;
  linkUrl?: string | null;
  small?: boolean;
  description: string;
  name: string;
  holdersRemaining?: number;
  holdersFeatured?: string[];
  holders?: number;
  profile?: boolean;
  domain?: string;
  primarySponsor?: string;
  allSponsors?: string[];
  sponsorshipAvailable?: boolean;
  groupChatAvailable?: boolean;
  rank?: number;
  badgeCode: string;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
  authWallet?: string;
  authorizedAddresses?: string[];
  authDomain?: string;
}

const BadgePopupModal = ({
  holdersFeatured,
  holdersRemaining,
  holders,
  name,
  description,
  isOpenModal,
  handleShowModal,
  logo,
  linkUrl,
  profile,
  domain,
  primarySponsor,
  allSponsors,
  sponsorshipAvailable,
  groupChatAvailable,
  badgeCode,
  rank,
  setWeb3Deps,
  authWallet,
  authorizedAddresses,
  authDomain,
}: Props) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const {setOpenCommunity} = useUnstoppableMessaging();
  const {chatUser, setOpenChat} = useUnstoppableMessaging();
  const [openPopover, setOpenPopover] = useState(false);
  const [openComposeMessageModal, setOpenComposeMessageModal] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const otherSponsors = allSponsors?.filter(s => s !== primarySponsor);
  const openseaBadge = badgeCode.startsWith('opensea-');
  const handleClickToCopy = () => {
    enqueueSnackbar(t('common.copied'), {variant: 'success'});
  };

  const canSendMessage =
    authWallet && authDomain && !!setWeb3Deps
      ? authorizedAddresses?.includes(authWallet)
      : false;

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
  };

  const handleSponsorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/badge/activate/${badgeCode}`;
  };

  const handleGroupChatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCommunity(badgeCode);
    handleShowModal();
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
    setOpenPopover(false);
  };

  const handleViewBadgePageClick = () => {
    void router.push(`/badge/${badgeCode}`);
  };

  const getSponsorsTooltip = () => {
    return (
      <div>
        <Typography variant="body1" className={classes.sponsorName}>
          {t('badges.alsoSponsoredBy')}
        </Typography>
        {otherSponsors?.map(s => (
          <Typography variant="body1" key={`sponsor-${badgeCode}-${s}`}>
            - {s}
          </Typography>
        ))}
      </div>
    );
  };

  const handleDescription = () => {
    if (description?.length > 205) {
      return (
        <>
          <Typography
            variant="body1"
            className={classes.modalSubTitle}
            data-testid={'modal-description'}
          >
            {description.substring(0, 205)} ...
            <Link
              className={classes.descriptionLink}
              href={linkUrl}
              target="_blank"
              data-testid="see-more-link"
            >
              {' '}
              {t('nftCollection.seeMore')}
            </Link>
          </Typography>
        </>
      );
    }
    return (
      <>
        <Typography
          variant="body1"
          className={classes.modalSubTitle}
          data-testid={'modal-description'}
        >
          {description}
        </Typography>
      </>
    );
  };

  return (
    <Dialog
      open={isOpenModal}
      onClose={handleShowModal}
      maxWidth={'lg'}
      data-testid={'badge-modal-container'}
    >
      <Grid container spacing={0}>
        <DialogContent className={classes.dialogContainer}>
          <Grid item xs={12} sm={6}>
            <div
              className={cx(classes.modalIcon, {
                [classes.pointer]: openseaBadge,
              })}
              onClick={openseaBadge ? handleViewBadgePageClick : undefined}
            >
              <Typography
                variant={'body1'}
                className={classes.modalDescription}
              >
                {name}
              </Typography>
              <img
                src={logo}
                width={'100%'}
                height={'100%'}
                className={classes.modalIconWithCircle}
                alt="badge logo"
              />
              <Typography
                variant={'body1'}
                className={classes.modalDescription}
              >
                {t('badges.holder')}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={8} lg={8} xl={8}>
            <DialogActions className={classes.closeIconSection}>
              <IconButton
                onClick={handleShowModal}
                className={classes.closeButton}
              >
                <Close className={classes.closeIcon} fontSize={'small'} />
              </IconButton>
            </DialogActions>
            <DialogContent className={classes.infoSection}>
              {primarySponsor && (
                <div className={classes.sponsorSection}>
                  <Typography className={classes.sponsor} variant={'body1'}>
                    {t('badges.sponsoredBy')}:
                  </Typography>{' '}
                  {primarySponsor.split('.').length === 2 ? (
                    <Link
                      href={`${config.UD_ME_BASE_URL}/${primarySponsor}`}
                      className={classes.descriptionLink}
                      target="_blank"
                    >
                      <Typography
                        variant={'body1'}
                        className={classes.sponsorName}
                      >
                        {primarySponsor}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography
                      variant={'body1'}
                      className={classes.sponsorName}
                    >
                      {primarySponsor}
                    </Typography>
                  )}
                  {otherSponsors && otherSponsors.length > 0 && (
                    <LightTooltip title={getSponsorsTooltip()} arrow>
                      <InfoOutlinedIcon
                        className={classes.sponsorInfoIcon}
                        fontSize="small"
                      />
                    </LightTooltip>
                  )}
                </div>
              )}
              <DialogTitle className={classes.title}>
                <Typography
                  variant={'h4'}
                  className={cx(classes.modalTitle, {
                    [classes.pointer]: openseaBadge,
                    [classes.hoverHighlight]: openseaBadge,
                  })}
                  onClick={openseaBadge ? handleViewBadgePageClick : undefined}
                >
                  {name}
                </Typography>
              </DialogTitle>

              {handleDescription()}

              {(holdersRemaining ||
                (holdersFeatured && holdersFeatured?.length > 0)) && (
                <>
                  <Typography
                    variant={'subtitle1'}
                    className={classes.holderTitle}
                  >
                    {t('badges.holder')}
                  </Typography>
                  {rank && (
                    <Link
                      className={classes.modalRankText}
                      variant={'caption'}
                      target="_blank"
                      href={`${config.UNSTOPPABLE_WEBSITE_URL}/leaderboard`}
                    >
                      {t('badges.rankNumber', {rank})}
                    </Link>
                  )}
                  <Typography className={classes.modalUsageText}>
                    {holdersFeatured && holdersFeatured.length > 0 && (
                      <AvatarGroup
                        total={holdersRemaining || 0 + holdersFeatured.length}
                      >
                        {holdersFeatured?.map(holdersDomain => (
                          <DomainPreview
                            key={`holder-${badgeCode}-${holdersDomain}`}
                            domain={holdersDomain}
                            size={20}
                            chatUser={chatUser}
                            setOpenChat={setOpenChat}
                            setWeb3Deps={setWeb3Deps}
                          />
                        ))}
                      </AvatarGroup>
                    )}
                  </Typography>
                </>
              )}
              <div className={classes.buttonsSection}>
                {(linkUrl || openseaBadge) && (
                  <Button
                    variant="outlined"
                    className={classes.learnMoreButton}
                    fullWidth
                    onClick={
                      openseaBadge
                        ? handleViewBadgePageClick
                        : () => {
                            // this is just to make TypeScript happy -- there will always be a link value at this point given the outer condition
                            if (!linkUrl) return;
                            window.open(linkUrl, '_blank');
                          }
                    }
                  >
                    {openseaBadge
                      ? t('badges.viewLeaderboard')
                      : t('common.learnMore')}
                  </Button>
                )}
                {profile && (
                  <>
                    {sponsorshipAvailable && (
                      <LightTooltip
                        title={
                          primarySponsor
                            ? t('badgeClaimPurchase.addAnotherSponsorship')
                            : t('badgeClaimPurchase.sponsorThisCommunity')
                        }
                        arrow
                      >
                        <IconButton
                          id={`add-sponsorship-button`}
                          data-testid={`add-sponsorship-button`}
                          onClick={handleSponsorClick}
                          className={classes.iconContainer}
                        >
                          <VolunteerActivismIcon className={classes.icons} />
                        </IconButton>
                      </LightTooltip>
                    )}
                    {chatUser && groupChatAvailable && (
                      <LightTooltip title={t('push.join')} arrow>
                        <IconButton
                          id={`group-chat-button`}
                          data-testid={`group-chat-button`}
                          onClick={handleGroupChatClick}
                          className={classes.iconContainer}
                        >
                          <ForumOutlinedIcon className={classes.icons} />
                        </IconButton>
                      </LightTooltip>
                    )}
                    {canSendMessage && (
                      <LightTooltip title={t('profile.sendMessage')} arrow>
                        <IconButton
                          onClick={() => setOpenComposeMessageModal(true)}
                          className={classes.iconContainer}
                        >
                          <SendIcon className={classes.icons} />
                        </IconButton>
                      </LightTooltip>
                    )}
                    <LightTooltip title={t('profile.share')} arrow>
                      <IconButton
                        onClick={handleShareClick}
                        className={classes.iconContainer}
                      >
                        <IosShareIcon className={classes.icons} />
                      </IconButton>
                    </LightTooltip>
                    <Popover
                      className={classes.popOverContainer}
                      open={openPopover}
                      onClose={handleClosePopOver}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <div className={classes.popOver}>
                        <CopyToClipboard
                          onCopy={handleClickToCopy}
                          stringToCopy={`${config.UD_ME_BASE_URL}/${domain}?openBadgeCode=${badgeCode}`}
                        >
                          <Typography
                            variant={'body1'}
                            className={classes.copyLink}
                          >
                            <LinkIcon className={classes.linkIcon} />
                            {t('badges.copyLink')}
                          </Typography>
                        </CopyToClipboard>
                      </div>
                    </Popover>
                  </>
                )}
              </div>
            </DialogContent>
          </Grid>
        </DialogContent>
      </Grid>
      {!!setWeb3Deps && authWallet && authDomain && (
        <Dialog
          open={openComposeMessageModal}
          onClose={() => setOpenComposeMessageModal(false)}
          fullWidth
          maxWidth={'sm'}
        >
          <ComposeMessage
            badge={name}
            badgeCode={badgeCode}
            defaultImage={logo}
            holders={holders}
            onClose={() => setOpenComposeMessageModal(false)}
            setWeb3Deps={setWeb3Deps}
            authWallet={authWallet}
            authDomain={authDomain}
          ></ComposeMessage>
        </Dialog>
      )}
    </Dialog>
  );
};

export default BadgePopupModal;
