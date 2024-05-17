import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HelpIcon from '@mui/icons-material/Help';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '243px',
    border: '1px solid grey',
    borderRadius: '8px',
    padding: '9px',
  },
  educationCarouselContainer: {
    width: '31em',
    overflowX: 'auto',
  },
  educationCarousel: {
    display: 'flex',
    flexWrap: 'nowrap',
    transition: 'transform 0.5s ease-in-out',
  },
}));

type Props = {
  title: string;
  content: string;
  icon: React.ReactNode;
};

const InlineEducationCard: React.FC<Props> = ({title, content, icon}) => {
  const {classes} = useStyles();

  return (
    <Box className={classes.container}>
      <Box display="flex">
        {icon}
        <Typography variant="h6" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="subtitle1">{content}</Typography>
    </Box>
  );
};

const Cards = [
  {
    title: 'What is MPC?',
    content: 'MPC stands for Multi-Party Computation',
    icon: <WalletIcon />,
  },
  {
    title: 'Enhanced Security',
    content:
      'MPC protects your funds by distributing trust among multiple parties',
    icon: <SecurityIcon />,
  },
  {
    title: 'Keep Your Funds Safe',
    content: 'Store your recovery phrase in a safe place',
    icon: <LockIcon />,
  },
  {
    title: 'Need Help?',
    content: 'Contact support if you have any questions',
    icon: <HelpIcon />,
  },
];
const InlineEducation: React.FC = () => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % Cards.length);
      }, 5000);
    }

    return () => clearInterval(autoScrollInterval.current!);
  }, [isAutoScrolling]);

  useEffect(() => {
    const translateX = -currentIndex * 25;
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex]);

  const handleScroll = () => {
    setIsAutoScrolling(false);
  };

  return (
    <Box
      display="flex"
      gap={1}
      mt={1}
      mb={2}
      className={classes.educationCarouselContainer}
      onScroll={handleScroll}
    >
      <Box
        display="flex"
        gap={1}
        className={classes.educationCarousel}
        ref={carouselRef}
      >
        {Cards.map(card => (
          <InlineEducationCard
            title={card.title}
            content={card.content}
            icon={card.icon}
          />
        ))}
      </Box>
    </Box>
  );
};

export default InlineEducation;
