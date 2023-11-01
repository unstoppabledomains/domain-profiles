import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';
import type {DomainBadgesResponse} from '../../lib/types/badge';
import type {Web3Dependencies} from '../../lib/types/web3';
import CustomBadgesDialog from '../CustomBadges/CustomBadgesDialog';
import Badge, {DEFAULT_BADGE_SIZE, MOBILE_BADGE_SIZE} from './Badge';

type StyleProps = {
  isMobile?: boolean;
};
const useStyles = makeStyles<StyleProps>()((theme: Theme, {isMobile}) => ({
  button: {
    width: '100%',
    marginBottom: theme.spacing(-2),
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeHolder: {
    boxShadow: theme.shadows[6],
    border: `1px solid ${theme.palette.neutralShades[200]}`,
    borderRadius: '50%',
    width: isMobile ? MOBILE_BADGE_SIZE : DEFAULT_BADGE_SIZE,
    height: isMobile ? MOBILE_BADGE_SIZE : DEFAULT_BADGE_SIZE,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  placeholderIcon: {
    color: theme.palette.neutralShades[200],
  },
}));

type Props = DomainBadgesResponse & {
  usageEnabled?: boolean;
  profile?: boolean;
  domain: string;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  authWallet?: string;
  authDomain?: string;
};

const MAX_COUNT_FOR_FIRST_VIEW = 12;
const Badges: React.FC<Props> = ({
  list,
  countActive,
  usageEnabled,
  profile,
  domain,
  setWeb3Deps,
  authWallet,
  authDomain,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {classes} = useStyles({isMobile});
  const [t] = useTranslationContext();
  const [showMore, setShowMore] = useState<boolean>(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState<boolean>(false);
  const keyBase = list.map(b => b.code).join('-');

  const handleShowMore = () => {
    setShowMore(true);
  };

  const handleOpenBadgeModal = () => {
    setBadgeModalOpen(true);
  };

  const handleCloseBadgeModal = () => {
    setBadgeModalOpen(false);
  };

  const activeBadgeList = list.filter(
    ({active, expired}) => active && !expired,
  );
  const badges = showMore
    ? activeBadgeList
    : activeBadgeList.slice(0, MAX_COUNT_FOR_FIRST_VIEW);
  const badgesPerRow = isMobile ? 4 : 6;
  const placeholderCount =
    badges.length % badgesPerRow === 0
      ? 0
      : badgesPerRow - (badges.length % badgesPerRow);

  return (
    <>
      <Grid container spacing={2} key={`badgeListContainer-${keyBase}`}>
        {badges.map((badge, i) => (
          <Grid
            item
            xs={3}
            sm={2}
            key={`badge-${keyBase}-${badge.configId}-${i}`}
            className={classes.badgeContainer}
          >
            <Badge
              domain={domain}
              {...badge}
              usageEnabled={usageEnabled}
              tooltipPlacement="top"
              profile={profile}
              iconOnly={true}
              setWeb3Deps={setWeb3Deps}
              authWallet={authWallet}
              authDomain={authDomain}
            />
          </Grid>
        ))}
        {[...Array(placeholderCount)].map((badge, i) => (
          <Grid
            item
            xs={3}
            sm={2}
            className={classes.badgeContainer}
            key={`badgePlaceholder-${keyBase}-${i}`}
          >
            <div onClick={handleOpenBadgeModal} className={classes.placeHolder}>
              <AddIcon className={classes.placeholderIcon} />
            </div>
          </Grid>
        ))}
        {!showMore && countActive > MAX_COUNT_FOR_FIRST_VIEW && (
          <Grid item xs={12} key={`badgeShowMoreButton-${keyBase}`}>
            <Button
              variant="outlined"
              onClick={handleShowMore}
              className={classes.button}
            >
              {t('profile.showMore')}
            </Button>
          </Grid>
        )}
      </Grid>
      <CustomBadgesDialog
        open={badgeModalOpen}
        handleClose={handleCloseBadgeModal}
      />
    </>
  );
};

export default Badges;
export * from './Badge';
export {default as Badge} from './Badge';
export {default as BadgeRankings} from './BadgeRankings';
export {default as CollectionStats} from './CollectionStats';
export {default as ComposeMessage} from './ComposeMessage';
export {default as UnlockSponsorsLeaderboard} from './UnlockSponsorsLeaderboard';
