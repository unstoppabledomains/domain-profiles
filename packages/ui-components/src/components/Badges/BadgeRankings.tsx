import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getSponsorRankings} from '../../actions/badgeActions';
import {getDomainRankings} from '../../actions/domainActions';
import {DomainListModal} from '../../components/Domain/DomainListModal';
import DomainProfileList from '../../components/Domain/DomainProfileList';
import useTranslationContext from '../../lib/i18n';
import type {SerializedDomainRank} from '../../lib/types/domain';

const useStyles = makeStyles()((theme: Theme) => ({
  label: {
    height: '29px',
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    fontSize: '20px !important',
    display: 'flex',
    alignItems: 'center',
  },
  helpIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.neutralShades[600],
  },
  contentContainer: {
    minHeight: 437,
    boxShadow: '0px 1px 0px #DDDDDF, 0px 0px 0px 1px #DDDDDF',
    borderRadius: 8,
    padding: theme.spacing(2),
  },
  showMoreButton: {width: '100%', marginTop: theme.spacing(2)},
}));

type Props = {
  domains: string[];
  type: 'holders' | 'sponsors';
  badgeCode: string;
  fullWidth?: boolean;
};

const BadgeRankings: React.FC<Props> = ({
  domains,
  type,
  badgeCode,
  fullWidth,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [showMore, setShowMore] = useState(false);

  const handleShowMoreClicked = () => {
    setShowMore(true);
  };
  const handleCloseShowMore = () => {
    setShowMore(false);
  };

  const retrieveBadgeRankings = async (cursor?: number) => {
    let rankings: SerializedDomainRank[] | undefined = [];
    if (type === 'holders') {
      rankings = await getDomainRankings(200, false, badgeCode);
    } else {
      rankings = await getSponsorRankings(200, badgeCode);
    }
    if (!rankings) {
      return {domains: []};
    }
    return {domains: rankings.map(r => r.domain)};
  };

  return (
    <>
      <Grid item xs={12} md={fullWidth ? 12 : 6}>
        <Typography className={classes.label}>
          {type === 'holders'
            ? t('badge.badgeHolders')
            : t('badge.badgeSponsors')}
          <Tooltip
            title={
              type === 'holders'
                ? t('badge.badgeHoldersTooltip')
                : t('badge.badgeSponsorsTooltip')
            }
          >
            <HelpOutlineIcon className={classes.helpIcon} />
          </Tooltip>
        </Typography>
        <div className={classes.contentContainer}>
          <DomainProfileList
            domains={domains}
            isLoading={false}
            showNumber
            itemsPerPage={5}
            withPagination={false}
          />
          {domains.length > 5 && (
            <Button
              variant="outlined"
              className={classes.showMoreButton}
              onClick={handleShowMoreClicked}
            >
              {t('badge.showMore')}
            </Button>
          )}
        </div>
      </Grid>
      <DomainListModal
        title={
          type === 'holders'
            ? t('badge.badgeHolders')
            : t('badge.badgeSponsors')
        }
        retrieveDomains={retrieveBadgeRankings}
        open={!!showMore}
        onClose={handleCloseShowMore}
        showNumber
      />
    </>
  );
};

export default BadgeRankings;
