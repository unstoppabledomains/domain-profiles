import type {NextSeoProps} from 'next-seo';

import config from '@unstoppabledomains/config';

import getImageUrl from './domain/getImageUrl';
import {DomainProfileSocialMedia} from './types/domain';
import type {GetDomainSeoTagsProps} from './types/seo';
import {
  DEFAULT_SEO_DESCRIPTION,
  UD_TWITTER_HANDLE,
  UP_IO_TWITTER_HANDLE,
} from './types/seo';

export const getDomainSeoTags = (
  props: GetDomainSeoTagsProps,
): NextSeoProps => {
  // create the title
  const title = props.domain ? `${props.domain} | ${props.title}` : props.title;

  // if no profile data, return the default SEO tags
  if (!props.profileData) {
    return {
      title,
      description: props.description || DEFAULT_SEO_DESCRIPTION,
      openGraph: props.domainAvatar
        ? {
            images: [{url: props.domainAvatar}],
            url: props.domain
              ? `${config.UD_ME_BASE_URL}/${props.domain}`
              : undefined,
          }
        : undefined,
      twitter: {
        cardType: 'summary',
        site: `@${UD_TWITTER_HANDLE}`,
      },
    };
  }

  // generate custom SEO tags
  const seoTags: NextSeoProps = {
    title,
    description:
      props.profileData.profile?.description ?? DEFAULT_SEO_DESCRIPTION,
  };

  seoTags.openGraph = {
    url: `${config.UD_ME_BASE_URL}/${props.domain}`,
  };

  const imageUrl =
    // onChain image types do not render properly in Twitter Preview Cards
    props.domainAvatar && props.profileData.profile?.imageType === 'offChain'
      ? props.domainAvatar
      : getImageUrl('/unstoppable-logos/unstoppable-logo-1200x1200.png');

  seoTags.openGraph.images = [{url: imageUrl}];
  seoTags.twitter = {cardType: 'summary'};
  if (props.socialsInfo?.[DomainProfileSocialMedia.Twitter]?.screenName) {
    seoTags.twitter.site = `@${UD_TWITTER_HANDLE}`;
    seoTags.twitter.handle = `@${
      props.socialsInfo[DomainProfileSocialMedia.Twitter]?.screenName
    }`;
  }

  return seoTags;
};

export const getWalletSeoTags = (): NextSeoProps => {
  // common tags
  const title = 'UP.io ― Level up your crypto experience';
  const description =
    'Securely manage digital assets with confidence and ease. Buy, trade and swap tokens on Bitcoin, Ethereum, Solana, Base & Polygon.';

  return {
    title,
    description,
    canonical: `${config.UP_IO_BASE_URL}`,
    openGraph: {
      title,
      description,
      url: `${config.UP_IO_BASE_URL}`,
      locale: 'en',
      images: [
        {
          url: 'https://storage.googleapis.com/unstoppable-client-assets/images/upio/banner.png',
          width: 1200,
          height: 630,
          alt: 'UP.io Banner',
          type: 'image/png',
        },
        {
          url: 'https://storage.googleapis.com/unstoppable-client-assets/images/upio/logo/beta.png',
          width: 128,
          height: 128,
          alt: 'UP.io Logo',
          type: 'image/png',
        },
      ],
      siteName: 'UP.io',
      type: 'website',
    },
    twitter: {
      cardType: 'summary_large_image',
      site: `@${UP_IO_TWITTER_HANDLE}`,
    },
  };
};
