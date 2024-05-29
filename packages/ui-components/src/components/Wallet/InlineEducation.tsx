import HelpIcon from '@mui/icons-material/Help';
import LockIcon from '@mui/icons-material/Lock';
import LockResetIcon from '@mui/icons-material/LockReset';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useRef} from 'react';
import SwiperCore, {Autoplay, Navigation, Pagination} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import config from '@unstoppabledomains/config';
import UnstoppableWalletIcon from '@unstoppabledomains/ui-kit/icons/UnstoppableWalletIcon';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.primaryShades[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  educationCarouselContainer: {
    width: '31em',
    [theme.breakpoints.down('sm')]: {
      width: '355px',
    },
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
    marginBottom: theme.spacing(-6),
  },
  swiper: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: '1px',
    paddingRight: '1px',
    marginRight: theme.spacing(-2),
  },
  swiperPagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    minHeight: '15px',
    width: '100%',
  },
}));

const swiperCss = `
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
    title: 'Your Wallet for Domains',
    content: `Unstoppable Wallet is a user friendly wallet that gives you full ownership. Designed with domain investors as the first priority, it allows you to effortlessly store, manage and transfer your domains and other crypto investments.`,
    icon: <UnstoppableWalletIcon />,
  },
  {
    title: 'Advanced Technology',
    content: `Unstoppable Domains has partnered with <a href='https://fireblocks.com' target='_blank'>Fireblocks</a> to provide a next generation wallet, protecting your investments with advanced multi-party computation (MPC) technology. Fireblocks has facilitated $4T+ in transactions over 170M+ wallets.`,
    icon: <RocketLaunchIcon />,
  },
  {
    title: 'Enhanced Security',
    content: `Multi-party computation (MPC) protects your investments by distributing trust between Unstoppable Domains, Fireblocks and the user. Each must collaborate to access funds, reducing the risk of compromise and enhancing the integrity of your wallet. **<a href='https://ncw-developers.fireblocks.com/docs/main-capabilities' target='_blank'>Learn more</a>**`,
    icon: <SecurityIcon />,
  },
  {
    title: 'Self Custody',
    content:
      'Not your keys, not your crypto! Your password is the key to exclusive control over the contents of your Unstoppable Wallet. Every interaction requires your consent, such as transferring funds or signing messages.',
    icon: <VpnKeyIcon />,
  },
  {
    title: 'Backup and Recovery',
    content: `Users of traditional self custody wallets risk lockout if they lose their keys. Unstoppable Wallet offers an innovative way to restore access to your wallet through an optional recovery kit. **<a href='${config.WALLETS.DOCUMENTATION_URL}' target='_blank'>Learn more</a>**`,
    icon: <LockResetIcon />,
  },
  {
    title: 'Convenient Access',
    content:
      'You will never need to remember long seed phrases or deal with private keys. Simply use your password to access Unstoppable Wallet on any device through the website or on a supported mobile app.',
    icon: <MobileFriendlyIcon />,
  },
  {
    title: 'Safety First',
    content:
      'Store your Unstoppable Wallet password in a safe place and never share it with anyone. Always be on the lookout for suspicious links when entering your password on an app. **Unstoppable Domains staff will never ask you for your wallet password.**',
    icon: <LockIcon />,
  },
  {
    title: 'Support',
    content: `We are here to help! You can <a href='mailto:support@unstoppabledomains.com' target='_blank'>contact support</a> or reach out on social channels if you have any questions. You can also read more about Unstoppable Wallet in the <a href='${config.WALLETS.DOCUMENTATION_URL}' target='_blank'>documentation</a> found in the help center.`,
    icon: <HelpIcon />,
  },
];
const InlineEducation: React.FC = () => {
  const {classes} = useStyles();
  const paginationRef = useRef<HTMLDivElement | null>(null);

  SwiperCore.use([Autoplay, Navigation, Pagination]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Box
        display="flex"
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
          pagination={{
            el: paginationRef.current,
            clickable: true,
          }}
          navigation={false}
          className={classes.swiper}
          autoplay={{delay: 8000}}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 8,
            },
            320: {
              slidesPerView: 1,
              spaceBetween: 8,
            },
            // when window width is >= 600px
            600: {
              slidesPerView: 1,
              spaceBetween: 8,
            },
            // when window width is >= 640px
            768: {
              slidesPerView: 1,
              spaceBetween: 8,
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
      <Box className={classes.swiperPagination} ref={paginationRef} />
    </Box>
  );
};

export default InlineEducation;
