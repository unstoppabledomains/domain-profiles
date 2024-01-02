import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    verticalAlign: 'center',
    [theme.breakpoints.down('md')]: {
      alignItems: 'center',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  content: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
      overflow: 'scroll',
    },
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: theme.palette.neutralShades[600],
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.neutralShades[600],
  },
}));

type LeftBarContentCollapseProps = {
  id: string;
  icon: React.ReactNode;
  header: React.ReactNode;
  content?: React.ReactNode;
};

const LeftBarContentCollapse: React.FC<LeftBarContentCollapseProps> = ({
  id,
  header,
  icon,
  content,
}) => {
  const {classes} = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Box mr={1} className={classes.text}>
          {icon}
        </Box>
        <Box className={classes.text}>{header}</Box>
        {content && (
          <Box ml={1} className={classes.icon}>
            <ExpandMoreOutlinedIcon
              onClick={handleToggleExpanded}
              data-testid={`expand-${id}`}
            />
          </Box>
        )}
      </Box>
      {expanded && <Box className={classes.content}>{content}</Box>}
    </Box>
  );
};

export default LeftBarContentCollapse;
