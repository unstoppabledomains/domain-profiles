import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Bluebird from 'bluebird';
import React, {useEffect, useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainConnections} from '../../../../actions';
import type {SerializedRecommendation} from '../../../../lib';
import useTranslationContext from '../../../../lib/i18n';
import ChipControlButton from '../../../ChipControlButton';
import type {ConversationMeta} from '../../protocol/xmtp';
import {getConversationPeerAddress} from '../../protocol/xmtp';
import type {AddressResolution} from '../../types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(2),
  },
  loadingSpinner: {
    color: 'inherit',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    display: 'flex',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    justifyContent: 'center',
  },
  reasonsContainer: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.success.main,
  },
  icon: {
    width: 15,
    height: 15,
    marginRight: theme.spacing(0.5),
  },
  avatar: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    height: 50,
    width: 50,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
}));

export const ConversationSuggestions: React.FC<
  ConversationSuggestionsProps
> = ({address, conversations, onSelect, onSuggestionsLoaded}) => {
  const {cx, classes} = useStyles();
  const [t] = useTranslationContext();
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SerializedRecommendation[]>();

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsSuggestionsLoading(true);

      // retrieve suggestions
      const allSuggestions = await getDomainConnections(address, {
        recommendationsOnly: false,
        xmtpOnly: true,
      });

      // conversation addresses
      const conversationAddresses = await Bluebird.map(
        conversations || [],
        async c => {
          const peerAddress = await getConversationPeerAddress(c.conversation);
          return peerAddress?.toLowerCase();
        },
      );

      // filter out existing conversations from suggestion list
      const visibleSuggestions = allSuggestions?.filter(
        s => !conversationAddresses.includes(s.address.toLowerCase()),
      );

      // set the suggestion values to render
      if (visibleSuggestions && visibleSuggestions.length > 0) {
        if (onSuggestionsLoaded) {
          onSuggestionsLoaded(visibleSuggestions);
        }
        setSuggestions(visibleSuggestions);
      }
      setIsSuggestionsLoading(false);
    };
    void loadSuggestions();
  }, []);

  return (
    <Grid container gap={1} className={classes.container}>
      {suggestions && suggestions.length > 0
        ? suggestions.slice(0, 3).map(s => (
            <Grid item xs={12}>
              <ChipControlButton
                variant="outlined"
                color="default"
                sx={{
                  height: 'auto',
                  whitespace: 'normal',
                  paddingLeft: 0.5,
                  paddingRight: 0.5,
                  paddingTop: 1,
                  paddingBottom: 1,
                  justifyContent: 'left',
                  textAlign: 'left',
                  width: '100%',
                }}
                size="small"
                onClick={() =>
                  onSelect({
                    address: s.address,
                    name: s.domain,
                    avatarUrl: s.imageUrl,
                  })
                }
                label={
                  <Box className={classes.card}>
                    <Avatar src={s.imageUrl} className={classes.avatar} />
                    <Box className={classes.detailsContainer}>
                      <Typography variant="subtitle2">
                        {s.domain ||
                          `${t('common.wallet')} ${truncateEthAddress(
                            s.address,
                          )}`}
                      </Typography>
                      <Box className={cx(classes.reasonsContainer)}>
                        <ShareOutlinedIcon className={classes.icon} />
                        <Typography variant="caption">
                          {s.reasons.map(v => v.description).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              />
            </Grid>
          ))
        : isSuggestionsLoading && (
            <Box className={classes.loadingContainer}>
              <CircularProgress
                size="15px"
                className={classes.loadingSpinner}
              />
              <Typography ml={1} variant="caption">
                {t('push.searchingForConnections')}
              </Typography>
            </Box>
          )}
    </Grid>
  );
};

export type ConversationSuggestionsProps = {
  address: string;
  conversations?: ConversationMeta[];
  onSelect: (peer: AddressResolution) => void;
  onSuggestionsLoaded?: (v?: SerializedRecommendation[]) => void;
};

export default ConversationSuggestions;
