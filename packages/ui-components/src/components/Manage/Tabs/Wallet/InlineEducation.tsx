import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HelpIcon from '@mui/icons-material/Help';
import LockIcon from '@mui/icons-material/Lock';
import LockResetIcon from '@mui/icons-material/LockReset';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useRef, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '243px',
    height: '100%',
    backgroundColor: theme.palette.primaryShades[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
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
  educationTitle: {
    fontWeight: 'bold',
    marginLeft: theme.spacing(1),
  },
  educationCardTitle: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.neutralShades[800],
    marginBottom: theme.spacing(1),
  },
  educationCardContent: {
    color: theme.palette.neutralShades[800],
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
      <Box className={classes.educationCardTitle}>
        {icon}
        <Typography variant="body1" className={classes.educationTitle}>
          {title}
        </Typography>
      </Box>
      <Typography variant="caption" className={classes.educationCardContent}>
        <Markdown>{content}</Markdown>
      </Typography>
    </Box>
  );
};

const Cards = [
  {
    title: 'What is MPC?',
    content: `MPC stands for multi-party computation. Unstoppable Wallet uses advanced MPC technology provided by <a href='https://fireblocks.com' target='_blank'>Fireblocks</a> to secure your wallet. As a trusted partner, Fireblocks has facilitated $4T+ over 170M+ wallets.`,
    icon: <WalletIcon />,
  },
  {
    title: 'Enhanced Security',
    content: `MPC protects your funds by distributing trust between individuals or organizations. Multiple parties must collaborate in order to interact with your funds, reducing the risk of compromise and enhancing the integrity of your wallet. **<a href='https://ncw-developers.fireblocks.com/docs/main-capabilities' target='_blank'>Learn more</a>**`,
    icon: <SecurityIcon />,
  },
  {
    title: 'Self custody',
    content:
      'Not your keys, not your crypto! You have exclusive control over your Unstoppable Wallet contents. Every interaction requires your consent, such as transfers and signatures.',
    icon: <VpnKeyIcon />,
  },
  {
    title: 'Backup and Recovery',
    content: `Many self custody wallets come with the risk of lockout if a user loses their private key. Unstoppable Wallet offers an optional recovery feature, enabled by MPC technology to gain access to your wallet through a recovery link. **<a href='https://unstoppabledomains.freshdesk.com/support/solutions/48000457487' target='_blank'>Learn more</a>**`,
    icon: <LockResetIcon />,
  },
  {
    title: 'Convenient Access',
    content:
      'You will never need to remember long seed phrases, mnemonics or deal with private keys. Simply use your password to access Unstoppable Wallet on any device through the website or on a supported Unstoppable Domains mobile app.',
    icon: <MobileFriendlyIcon />,
  },
  {
    title: 'Keep Your Funds Safe',
    content:
      'Store your Unstoppable Wallet password in a safe place and never share it with anyone. Unstoppable Domains staff will never ask you for your wallet password.',
    icon: <LockIcon />,
  },
  {
    title: 'Need Help?',
    content: `Contact support if you have any questions or read more in the **<a href='https://unstoppabledomains.freshdesk.com/support/solutions/48000457487'>documentation</a>**.`,
    icon: <HelpIcon />,
  },
];
const InlineEducation: React.FC = () => {
  const {classes} = useStyles();
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
