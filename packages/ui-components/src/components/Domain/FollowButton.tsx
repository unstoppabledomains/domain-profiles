import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  followDomainProfile,
  unfollowDomainProfile,
  useDomainProfileFollowStatus,
} from '../../actions/domainProfileActions';
import {ProfileManager} from '../../components/Wallet/ProfileManager';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';
import ChipControlButton from '../ChipControlButton';

const useStyles = makeStyles<{color?: string}>()((theme: Theme, {color}) => ({
  followButtonSmall: {
    marginLeft: theme.spacing(0.5),
    color: color || 'white',
  },
}));

type FollowButtonProps = {
  domain: string;
  authDomain: string;
  authAddress: string;
  color?: string;
  handleLogin?: () => void;
  onFollowClick?: () => void;
  onUnfollowClick?: () => void;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  small?: boolean;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  authDomain,
  domain,
  authAddress,
  color,
  setWeb3Deps,
  handleLogin,
  onFollowClick,
  onUnfollowClick,
  small,
}) => {
  const {classes} = useStyles({color});
  const {data: followStatus, isLoading} = useDomainProfileFollowStatus(
    authDomain,
    domain,
  );
  const [isFollowing, setIsFollowing] = useState(
    followStatus?.isFollowing ?? false,
  );
  const [followClicked, setFollowClicked] = useState(false);
  const [t] = useTranslationContext();

  useEffect(() => {
    // Update the isFollowing state when isLoading becomes false
    if (
      !isLoading &&
      followStatus &&
      followStatus.followerDomain === authDomain &&
      followStatus.followeeDomain === domain
    ) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [isLoading, followStatus]);

  const handleClick = () => {
    if (!authDomain || !authAddress) {
      if (handleLogin) {
        handleLogin();
      }
      return;
    }
    setFollowClicked(true);
  };

  const handleCallback = async (signature: string, expires: string) => {
    setIsFollowing(!isFollowing);
    if (isFollowing) {
      await unfollowDomainProfile(authDomain, domain, {
        signature,
        expires,
      });
      if (onUnfollowClick) onUnfollowClick();
    } else {
      await followDomainProfile(authDomain, domain, {
        signature,
        expires,
      });
      if (onFollowClick) onFollowClick();
    }
  };

  return (
    <>
      {small ? (
        <Tooltip
          title={isFollowing ? t('profile.unfollow') : t('profile.follow')}
          placement="top"
          arrow
        >
          <IconButton
            onClick={handleClick}
            data-testid="follow-button"
            className={classes.followButtonSmall}
            size="small"
          >
            {isFollowing ? (
              <RemoveIcon
                fontSize="inherit"
                sx={{'&&': {color: color || 'white'}}}
              />
            ) : (
              <AddIcon
                fontSize="inherit"
                sx={{'&&': {color: color || 'white'}}}
              />
            )}
          </IconButton>
        </Tooltip>
      ) : (
        <ChipControlButton
          onClick={handleClick}
          icon={!isFollowing ? <AddIcon /> : <CheckIcon />}
          label={isFollowing ? t('profile.following') : t('profile.follow')}
          data-testid="follow-button"
        />
      )}
      <ProfileManager
        domain={authDomain}
        ownerAddress={authAddress}
        setWeb3Deps={setWeb3Deps}
        saveClicked={followClicked}
        setSaveClicked={setFollowClicked}
        onSignature={handleCallback}
      />
    </>
  );
};

export default FollowButton;
