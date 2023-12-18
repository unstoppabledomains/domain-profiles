/* eslint-disable @typescript-eslint/no-explicit-any */
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {Conversation} from '@xmtp/xmtp-js';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import Emoji from 'react-emoji-render';
import truncateEthAddress from 'truncate-eth-address';
import {useIntersectionObserver} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {isAddressSpam} from '../../../../actions/messageActions';
import useTranslationContext from '../../../../lib/i18n';
import {getAddressMetadata} from '../../protocol/resolution';
import type {ConversationMeta} from '../../protocol/xmtp';
import {loadConversationPreview} from '../../protocol/xmtp';

const useStyles = makeStyles()((theme: Theme) => ({
  conversationContainer: {
    display: 'flex',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
    borderBottom: '1px dashed #eeeeee',
    height: '70px',
    alignItems: 'center',
  },
  avatar: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  avatarLoading: {
    marginRight: theme.spacing(2),
    width: '44px',
    height: '44px',
  },
  fromLoading: {
    width: '50%',
    height: 20,
  },
  textLoading: {
    width: '100%',
    height: 15,
  },
  chatPreview: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'top',
  },
  chatTimestamp: {
    minWidth: '65px',
    textAlign: 'right',
    color: theme.palette.neutralShades[600],
  },
  warningContainer: {
    display: 'flex',
    color: theme.palette.warning.main,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  warningIcon: {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(0.5),
    width: '20px',
    height: '20px',
  },
}));

export const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  conversation,
  acceptedTopics,
  selectedCallback,
  searchTermCallback,
  searchTerm,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [avatarLink, setAvatarLink] = useState<string>();
  const [isVisible, setIsVisible] = useState(true);
  const [isSpam, setIsSpam] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayName, setDisplayName] = useState(
    truncateEthAddress(conversation.conversation.peerAddress),
  );

  // determine if conversation is visible on screen
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const nodeObserver = useIntersectionObserver(nodeRef, {});
  const nodeOnScreen = !!nodeObserver?.isIntersecting;

  useEffect(() => {
    if (!conversation || !nodeOnScreen || isLoaded) {
      return;
    }
    const loadAddressData = async () => {
      // if conversation is not accepted, check spam score
      if (!acceptedTopics.includes(conversation.conversation.topic)) {
        if (await isAddressSpam(conversation.conversation.peerAddress)) {
          setIsSpam(true);
        }
      }

      // request peer address metadata
      const addressData = await getAddressMetadata(
        conversation.conversation.peerAddress,
      );
      if (addressData?.name) setDisplayName(addressData.name);
      setAvatarLink(addressData?.avatarUrl);

      // get message preview
      await loadConversationPreview(conversation);

      // conversation preview is finished loading
      setIsLoaded(true);
    };
    void loadAddressData();
  }, [conversation, nodeOnScreen]);

  useEffect(() => {
    const v = isSearchTermMatch();
    setIsVisible(v);
    searchTermCallback(v);
  }, [searchTerm]);

  const isSearchTermMatch = (): boolean => {
    if (!searchTerm) {
      return true;
    }
    const searchParams = [
      displayName,
      conversation.conversation.peerAddress,
      conversation.preview,
    ];
    for (const param of searchParams) {
      if (param.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  return isVisible ? (
    <Box ref={nodeRef}>
      {isLoaded ? (
        conversation.timestamp > 0 && (
          <Box
            className={classes.conversationContainer}
            onClick={() => selectedCallback(conversation.conversation)}
          >
            <Box>
              <Avatar src={avatarLink} className={classes.avatar} />
            </Box>
            <Box className={classes.chatPreview}>
              <Box className={classes.chatHeader}>
                <Typography variant="subtitle2">{displayName}</Typography>
                <Box className={classes.chatTimestamp}>
                  <Typography variant="caption">
                    {moment(conversation.timestamp).fromNow()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">
                {isSpam ? (
                  <Box className={classes.warningContainer}>
                    <WarningAmberOutlinedIcon className={classes.warningIcon} />
                    {t('push.spamWarning')}
                  </Box>
                ) : conversation.preview ? (
                  <Emoji>{conversation.preview}</Emoji>
                ) : (
                  <Skeleton variant="text" className={classes.textLoading} />
                )}
              </Typography>
            </Box>
          </Box>
        )
      ) : (
        <Box className={classes.conversationContainer}>
          <Box>
            <Skeleton variant="circular" className={classes.avatarLoading} />
          </Box>
          <Box className={classes.chatPreview}>
            <Skeleton variant="text" className={classes.fromLoading} />
            <Skeleton variant="text" className={classes.textLoading} />
          </Box>
        </Box>
      )}
    </Box>
  ) : null;
};

export type ConversationPreviewProps = {
  conversation: ConversationMeta;
  acceptedTopics: string[];
  selectedCallback: (conversation: Conversation) => void;
  searchTermCallback: (visible: boolean) => void;
  searchTerm?: string;
};

export default ConversationPreview;
