import AddCartIcon from '@mui/icons-material/AddShoppingCart';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DomainPreview} from '../../components/Domain/DomainPreview';
import Modal from '../../components/Modal';
import getImageUrl from '../../lib/domain/getImageUrl';
import useTranslationContext from '../../lib/i18n';
import type {SerializedBadgeInfo} from '../../lib/types/badge';
import type {Web3Dependencies} from '../../lib/types/web3';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: '24px',
    boxShadow: theme.shadows[6],
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontWeight: 700,
    fontSize: 20,
    marginTop: theme.spacing(2),
  },
  leaderboardBackgroundImage: {},
  sponsorTagsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    margin: theme.spacing(2),
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorTag: {
    border: `1px solid ${theme.palette.neutralShades[200]}`,
    borderRadius: 100,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  emptySponsorTag: {
    border: `1px dashed ${theme.palette.neutralShades[200]}`,
    borderRadius: 100,
    width: 32,
    height: 32,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorNumber: {
    color: theme.palette.neutralShades[600],
    fontWeight: 600,
    fontSize: 16,
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
  sponsor: {
    marginLeft: theme.spacing(0.5),
    fontWeight: 600,
    fontSize: 16,
  },
  badgeLogo: {
    width: 100,
    height: 100,
    border: `4px solid ${theme.palette.background.default}`,
    borderRadius: 100,
  },
  modalContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '-48px',
    width: '372px',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(3),
    },
  },
  modalTitle: {
    fontWeight: 700,
    fontSize: 22,
  },
  modalSubtitle: {
    fontWeight: 700,
    fontSize: 22,
    color: theme.palette.neutralShades[600],
  },
  modalDescription: {
    fontWeight: 400,
    fontSize: 16,
    color: theme.palette.neutralShades[600],
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  cartIcon: {marginRight: theme.spacing(1)},
  modalButton: {
    height: 48,
    width: '100%',
  },
}));

type Props = {sponsors: string[]; badgeData: SerializedBadgeInfo};

const UnlockSponsorsLeaderboard: React.FC<Props> = ({sponsors, badgeData}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [web3Deps, setWeb3Deps] = useState<Web3Dependencies | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const becomeSponsorClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAddToCartClick = () => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/badge/activate/${badgeData.badge.code}`;
  };

  return (
    <>
      <Grid item md={12}>
        <div className={classes.container}>
          <img
            src={getImageUrl(`/common/leaderboard-background.svg`)}
            alt=""
            className={classes.leaderboardBackgroundImage}
          />

          <Typography className={classes.title}>
            {t('badge.unlockSponsorsLeaderboard', {
              sponsorsLeft: badgeData.sponsorship.max - sponsors.length,
            })}
          </Typography>
          <div className={classes.sponsorTagsContainer}>
            {sponsors.map((sponsor, i) => (
              <div className={classes.sponsorTag}>
                <span
                  className={cx(classes.sponsorNumber, classes.marginRight)}
                >
                  {i + 1}
                </span>
                <DomainPreview
                  domain={sponsor}
                  size={30}
                  setWeb3Deps={setWeb3Deps}
                />
                <Typography className={classes.sponsor}>{sponsor}</Typography>
              </div>
            ))}
            {Array.from(
              {length: badgeData.sponsorship.max - sponsors.length},
              (_, i) => sponsors.length + i,
            ).map(n => (
              <div className={classes.emptySponsorTag}>
                <span className={classes.sponsorNumber}>{n + 1}</span>
              </div>
            ))}
          </div>
          <Button onClick={becomeSponsorClick} variant="contained">
            {t('badge.becomeABadgeSponsor')}
          </Button>
        </div>
      </Grid>
      <Modal
        title={''}
        open={modalOpen}
        onClose={handleModalClose}
        noContentPadding
      >
        <div className={classes.modalContentContainer}>
          <img src={badgeData.badge.logo} className={classes.badgeLogo} />
          <Typography className={classes.modalTitle}>
            {t('badge.becomeBadgeSponsor')}
          </Typography>
          <Typography className={classes.modalSubtitle}>
            {badgeData.badge.name}
          </Typography>
          <Typography className={classes.modalDescription}>
            {t('badge.becomeABadgeSponsorDescription')}
          </Typography>
          <Button
            variant="contained"
            className={classes.modalButton}
            onClick={handleAddToCartClick}
          >
            <AddCartIcon className={classes.cartIcon} />
            {`${t('domainSuggestion.addToCart')}`}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default UnlockSponsorsLeaderboard;
