import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import useTranslationContext from 'lib/i18n';
import type {SerializedBadgeInfo} from 'lib/types/badge';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {display: 'flex', gap: theme.spacing(1)},
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  number: {
    fontWeight: 700,
    fontSize: '20px !important',
  },
  description: {
    fontWeight: 400,
    fontSize: '16px !important',
    color: theme.palette.neutralShades[600],
  },
  divider: {margin: theme.spacing(3, 0)},
}));

type Props = {badgeData: SerializedBadgeInfo};

const CollectionStats: React.FC<Props> = ({badgeData}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const formatVolume = (num?: number) => {
    if (!num) {
      return '';
    }
    if (num < 1000) {
      return num.toFixed(3);
    }

    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.min(
      Math.floor(Math.log10(Math.abs(num)) / 3),
      units.length - 1,
    );

    const scaledNum = num / 10 ** (unitIndex * 3);
    const decimalDigits =
      scaledNum < 10 && scaledNum !== Math.floor(scaledNum) ? 1 : 0;

    return scaledNum.toFixed(decimalDigits) + units[unitIndex];
  };

  const marketplace = badgeData?.badge?.marketplace;
  if (
    !marketplace?.volume &&
    (!marketplace?.floorPrice?.value || !marketplace?.floorPrice?.currency)
  ) {
    return null;
  }
  return (
    <>
      <div className={classes.container}>
        {marketplace.volume ? (
          <div className={classes.item}>
            <Typography className={classes.number}>
              {formatVolume(marketplace.volume)}
            </Typography>
            <Typography className={classes.description}>
              {t('badges.totalVolume')}
            </Typography>
          </div>
        ) : null}
        {marketplace.floorPrice?.value && marketplace.floorPrice?.currency ? (
          <div className={classes.item}>
            <Typography className={classes.number}>
              {marketplace.floorPrice.value.toFixed(3)}{' '}
              {marketplace.floorPrice.currency}
            </Typography>
            <Typography className={classes.description}>
              {t('badges.floorPrice')}
            </Typography>
          </div>
        ) : null}
      </div>
      <Divider className={classes.divider} />
    </>
  );
};

export default CollectionStats;
