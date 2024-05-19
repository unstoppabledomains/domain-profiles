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
import React from 'react';
import SwiperCore, {Autoplay, Navigation} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '230px',
    height: '100%',
    backgroundColor: theme.palette.primaryShades[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  educationCarouselContainer: {
    width: '31em',
    overflowX: 'auto',
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
    marginBottom: theme.spacing(-4),
  },
  swiper: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: '1px',
    paddingRight: '1px',
  },
}));

const swiperCss = `
   .swiper-button-next::after, .swiper-button-prev::after {
     font-size: var(--swiper-navigation-small);
   }
  .swiper-button-prev, .swiper-button-next {
     box-sizing: border-box;
     width: 32px;
     height: 32px;
     background: rgba(255, 255, 255, 0.8);
  
     border: 1px solid #DDDDDF;
     backdrop-filter: blur(2px);
 
     border-radius: 50%;
  } 
  .swiper-wrapper { 
  padding-bottom: 1rem;
 }
`;

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
    content: `MPC stands for multi-party computation. Unstoppable Wallet uses advanced MPC technology by <a href='https://fireblocks.com' target='_blank'>Fireblocks</a> to secure your wallet. Fireblocks has facilitated $4T+ in transactions over 170M+ wallets.`,
    icon: <WalletIcon />,
  },
  {
    title: 'Enhanced Security',
    content: `MPC protects your funds by distributing trust between parties. Each must collaborate in order to access your funds, reducing the risk of compromise and enhancing the integrity of your wallet. **<a href='https://ncw-developers.fireblocks.com/docs/main-capabilities' target='_blank'>Learn more</a>**`,
    icon: <SecurityIcon />,
  },
  {
    title: 'Self custody',
    content:
      'Not your keys, not your crypto! You have exclusive control over the contents of your Unstoppable Wallet. Every interaction requires your consent, such as transferring funds or signing messages.',
    icon: <VpnKeyIcon />,
  },
  {
    title: 'Backup and Recovery',
    content: `Users of traditional self custody wallets risk lockout if they lose their private keys. Unstoppable Wallet offers a way to restore access to your wallet through an optional recovery link. **<a href='https://unstoppabledomains.freshdesk.com/support/solutions/48000457487' target='_blank'>Learn more</a>**`,
    icon: <LockResetIcon />,
  },
  {
    title: 'Convenient Access',
    content:
      'You will never need to remember long seed phrases or deal with private keys. Simply use your password to access Unstoppable Wallet on any device through the website or on a supported mobile app.',
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
    content: `Contact support if you have any questions or read more in the **<a href='https://unstoppabledomains.freshdesk.com/support/solutions/48000457487' target='_blank'>documentation</a>**.`,
    icon: <HelpIcon />,
  },
];
const InlineEducation: React.FC = () => {
  const {classes} = useStyles();

  SwiperCore.use([Autoplay, Navigation]);

  return (
    <Box
      display="flex"
      gap={1}
      mt={1}
      mb={2}
      className={classes.educationCarouselContainer}
    >
      <style>{swiperCss}</style>
      <Swiper
        data-testid={'wallet-carousel'}
        slidesPerGroup={1}
        loop={true}
        loopFillGroupWithBlank={false}
        pagination={false}
        navigation={false}
        className={classes.swiper}
        autoplay={true}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 16,
          },
          320: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          // when window width is >= 600px
          600: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          // when window width is >= 640px
          768: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
        }}
      >
        {Cards.map((card, index) => (
          <SwiperSlide key={`inlineEducation-${index}`}>
            <InlineEducationCard
              title={card.title}
              content={card.content}
              icon={card.icon}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default InlineEducation;
