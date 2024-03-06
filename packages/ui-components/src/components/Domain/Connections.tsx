import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import React from 'react';
import type {Tag} from 'react-tagcloud';
import {TagCloud} from 'react-tagcloud';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useUnstoppableMessaging, useWeb3Context} from '../../hooks';
import type {SerializedRecommendation} from '../../lib';
import {useTranslationContext} from '../../lib';
import {DomainPreview} from './DomainPreview';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  connectionReasonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    backgroundImage: `linear-gradient(${theme.palette.neutralShades[100]}, ${theme.palette.neutralShades[300]})`,
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
  const {chatUser, setOpenChat} = useUnstoppableMessaging();
  const theme = useTheme();

  const renderTag = (tag: Tag, fontSize: number, _color: string) => {
    return (
      <Box display="inline-block" mr={1} mb={0.5}>
        <DomainPreview
          domain={tag.value}
          size={fontSize}
          chatUser={chatUser}
          setOpenChat={setOpenChat}
          setWeb3Deps={setWeb3Deps}
          avatarDescription={
            <Typography
              ml={1}
              sx={{color: theme.palette.neutralShades[700], fontSize}}
            >
              {tag.value}
            </Typography>
          }
          secondaryDescription={
            <Box className={classes.connectionReasonContainer}>
              <Typography variant="body2">
                {t('profile.connectReasonTitle')}:
              </Typography>
              <List sx={{listStyleType: 'disc', pl: 4, mb: -1, mt: -1}}>
                {connections
                  ?.find(c => c.domain === tag.value)
                  ?.reasons.map(r => (
                    <ListItem
                      sx={{display: 'list-item'}}
                      key={`${tag.value}-${r}`}
                    >
                      <Typography variant="body2">{r}</Typography>
                    </ListItem>
                  ))}
              </List>
            </Box>
          }
        />
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <TagCloud
        minSize={12}
        maxSize={24}
        tags={(connections || []).map(c => ({
          value: c.domain || c.address,
          count: c.score,
        }))}
        disableRandomColor={true}
        renderer={renderTag}
      >
        {connections
          ?.filter(c => c.domain)
          .map((c, i) => {
            return <div key={`tc-${c.domain}-${i}`}>{c.domain}</div>;
          })}
      </TagCloud>
    </Box>
  );
};

export default Connections;
