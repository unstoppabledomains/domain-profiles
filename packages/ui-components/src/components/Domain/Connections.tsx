import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import type {Tag} from 'react-tagcloud';
import {TagCloud} from 'react-tagcloud';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useUnstoppableMessaging, useWeb3Context} from '../../hooks';
import type {SerializedRecommendation} from '../../lib';
import {DomainProfileKeys, useTranslationContext} from '../../lib';
import {localStorageWrapper} from '../Chat/storage';
import {DomainPreview} from './DomainPreview';
import FollowButton from './FollowButton';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  connectionContainer: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  connectionReasonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundImage: `linear-gradient(${theme.palette.white}, ${theme.palette.neutralShades[100]})`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    padding: theme.spacing(1),
    width: '100%',
  },
  loading: {
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: '100%',
  },
}));

type Props = {
  domain: string;
  connections?: SerializedRecommendation[];
};

const Connections: React.FC<Props> = ({domain, connections}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {setWeb3Deps} = useWeb3Context();
  const theme = useTheme();
  const {chatUser, setOpenChat} = useUnstoppableMessaging();
  const [authAddress, setAuthAddress] = useState<string>();
  const [authDomain, setAuthDomain] = useState<string>();
  const placeHolderTags = [1, 2, 3];

  // read from local storage on page load
  useEffect(() => {
    const loadAuth = async () => {
      setAuthAddress(
        (await localStorageWrapper.getItem(DomainProfileKeys.AuthAddress)) ||
          undefined,
      );
      setAuthDomain(
        (await localStorageWrapper.getItem(DomainProfileKeys.AuthDomain)) ||
          undefined,
      );
    };
    void loadAuth();
  }, []);

  const renderTag = (tag: Tag, fontSize: number, _color: string) => {
    const connectionNode = connections?.find(c => c.domain === tag.value);

    return (
      <Box className={classes.connectionContainer}>
        <Chip
          size="medium"
          color="default"
          label={
            connectionNode ? (
              <Box display="flex" alignItems="center">
                <DomainPreview
                  domain={tag.value}
                  size={fontSize + 5}
                  chatUser={chatUser}
                  setOpenChat={setOpenChat}
                  setWeb3Deps={setWeb3Deps}
                  avatarPath={connectionNode?.imageUrl}
                  avatarDescription={
                    <Typography
                      ml={1}
                      sx={{
                        fontSize,
                        fontWeight: 'bold',
                      }}
                    >
                      {tag.value}
                    </Typography>
                  }
                  secondaryDescription={
                    <Box className={classes.connectionReasonContainer}>
                      <Typography variant="body2">
                        {t('profile.connectionScore')}:{' '}
                        <b>{connectionNode.score}</b>
                      </Typography>
                      <List sx={{listStyleType: 'disc', pl: 4, mb: -1, mt: -1}}>
                        {connectionNode.reasons.map(r => (
                          <ListItem
                            sx={{display: 'list-item'}}
                            key={`${tag.value}-${r}`}
                          >
                            <Typography variant="body2">
                              {r.description}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  }
                />
                {authDomain && authAddress && (
                  <Box mr={-1}>
                    <FollowButton
                      small={true}
                      domain={tag.value}
                      authDomain={authDomain}
                      authAddress={authAddress}
                      setWeb3Deps={setWeb3Deps}
                      color={theme.palette.neutralShades[600]}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Box display="flex" alignItems="center">
                <Box mr={1}>
                  <Skeleton variant="circular" width="22px" height="22px" />
                </Box>
                <Skeleton variant="text" width="55px" height="20px" />
              </Box>
            )
          }
        />
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <TagCloud
        minSize={10}
        maxSize={18}
        tags={
          connections
            ? connections.map(c => ({
                value: c.domain || c.address,
                count: c.score,
              }))
            : placeHolderTags.map(i => ({
                value: `placeholder-${i}`,
                count: 1,
              }))
        }
        colorOptions={{
          hue: 'green',
          luminosity: 'dark',
        }}
        renderer={renderTag}
        shuffle={false}
      />
    </Box>
  );
};

export default Connections;
