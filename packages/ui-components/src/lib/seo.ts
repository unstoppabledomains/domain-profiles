import type {NextSeoProps} from 'next-seo';

import config from '@unstoppabledomains/config';

import getImageUrl from './domain/getImageUrl';
import {DomainProfileSocialMedia} from './types/domain';
import type {GetSeoTagsProps} from './types/seo';
import {DEFAULT_SEO_DESCRIPTION, UD_TWITTER_HANDLE} from './types/seo';

export const getSeoTags = (props: GetSeoTagsProps): NextSeoProps => {
  const title = props.domain ? `${props.domain} | ${props.title}` : props.title;

  if (!props.profileData) {
    return {
      title,
      description: props.description || DEFAULT_SEO_DESCRIPTION,
      openGraph: props.domainAvatar
        ? {
            images: [{url: props.domainAvatar}],
            url: props.url ? props.url : undefined,
          }
        : undefined,
    };
  }

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
