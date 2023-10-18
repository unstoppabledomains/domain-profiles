/* eslint-disable @typescript-eslint/no-explicit-any */
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type {Conversation} from '@xmtp/xmtp-js';
import {isAddressSpam} from 'actions/messageActions';
import useTranslationContext from 'lib/i18n';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import Emoji from 'react-emoji-render';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getAddressMetadata} from '../../protocol/resolution';
import type {ConversationMeta} from '../../protocol/xmtp';

const useStyles = makeStyles()((theme: Theme) => ({
  conversationContainer: {
    display: 'flex',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
    borderBottom: '1px dashed #eeeeee',
  },
  avatar: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
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

export type ConversationPreviewProps = {
  conversation: ConversationMeta;
  acceptedTopics: string[];
  selectedCallback: (conversation: Conversation) => void;
  searchTermCallback: (visible: boolean) => void;
  searchTerm?: string;
};

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

  useEffect(() => {
    if (!conversation) {
      return;
    }
    const loadAddressData = async () => {
      // if conversation is not accepted, check spam score
      if (!acceptedTopics.find(v => v === conversation.conversation.topic)) {
        // check peer address spam score
        if (await isAddressSpam(conversation.conversation.peerAddress)) {
          setIsSpam(true);
        }
      }

      // request peer address metadata
      setIsLoaded(true);
      const addressData = await getAddressMetadata(
        conversation.conversation.peerAddress,
      );
      if (addressData?.name) setDisplayName(addressData.name);
      setAvatarLink(addressData?.avatarUrl);
    };
    void loadAddressData();
  }, [conversation]);

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

  return isLoaded && isVisible ? (
    <Box
      onClick={() => selectedCallback(conversation.conversation)}
      className={classes.conversationContainer}
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
          ) : (
            <Emoji>{conversation.preview}</Emoji>
          )}
        </Typography>
      </Box>
    </Box>
  ) : null;
};

export default ConversationPreview;
