import CheckIcon from '@mui/icons-material/Check';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainConnections} from '../../../../actions';
import {SerializedRecommendation} from '../../../../lib';
import useTranslationContext from '../../../../lib/i18n';
import ChipControlButton from '../../../ChipControlButton';
import type {AddressResolution} from '../../types';

const useStyles = makeStyles()((theme: Theme) => ({
  loadingSpinner: {
    color: 'inherit',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(2),
  },
  card: {
    display: 'flex',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
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
    color: 'white',
  },
}));

export const ConversationSuggestions: React.FC<
  ConversationSuggestionsProps
> = ({address, onSelect, onSuggestionsLoaded}) => {
  const {cx, classes} = useStyles();
  const [t] = useTranslationContext();
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SerializedRecommendation[]>();

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsSuggestionsLoading(true);
      const v = await getDomainConnections(address, {
        recommendationsOnly: false,
        xmtpOnly: true,
      });
      if (v.length > 0) {
        if (onSuggestionsLoaded) {
          onSuggestionsLoaded(v);
        }
        setSuggestions(v);
      }
      setIsSuggestionsLoading(false);
    };
    void loadSuggestions();
  }, []);

  return (
    <Box className={classes.container}>
      {suggestions
        ? suggestions.slice(0, 3).map(s => (
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
                      {s.domain || s.address}
                    </Typography>
                    <Box className={cx(classes.reasonsContainer)}>
                      <CheckIcon className={classes.icon} />
                      <Typography variant="caption">
                        {s.reasons.map(v => v.description).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              }
            />
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
    </Box>
  );
};

export type ConversationSuggestionsProps = {
  address: string;
  onSelect: (peer: AddressResolution) => void;
  onSuggestionsLoaded?: (v?: SerializedRecommendation[]) => void;
};

export default ConversationSuggestions;
