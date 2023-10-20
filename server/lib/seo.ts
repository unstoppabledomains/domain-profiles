import getImageUrl from 'lib/domain/getImageUrl';
import {DomainProfileSocialMedia} from 'lib/types/domain';
import type {GetSeoTagsProps} from 'lib/types/seo';
import {DEFAULT_SEO_DESCRIPTION, UD_TWITTER_HANDLE} from 'lib/types/seo';
import type {NextSeoProps} from 'next-seo';

import config from '@unstoppabledomains/config';

export const getSeoTags = (props: GetSeoTagsProps): NextSeoProps => {
  const title = props.domain ? `${props.domain} | ${props.title}` : props.title;

  if (!props.profileData) {
    return {
      title,
      description: DEFAULT_SEO_DESCRIPTION,
    };
  }

  const seoTags: NextSeoProps = {
    title,
    description:
      props.profileData.profile.description ?? DEFAULT_SEO_DESCRIPTION,
  };

  seoTags.openGraph = {
    url: `${config.UD_ME_BASE_URL}/${props.domain}`,
  };

  const imageUrl =
    // onChain image types do not render properly in Twitter Preview Cards
    props.domainAvatar && props.profileData.profile.imageType === 'offChain'
      ? props.domainAvatar
      : getImageUrl('/unstoppable-logos/unstoppable-logo-1200x1200.png');

  seoTags.openGraph.images = [{url: imageUrl}];
  seoTags.twitter = {cardType: 'summary'};
  if (props.socialsInfo[DomainProfileSocialMedia.Twitter]?.screenName) {
    seoTags.twitter.site = `@${UD_TWITTER_HANDLE}`;
    seoTags.twitter.handle = `@${
      props.socialsInfo[DomainProfileSocialMedia.Twitter]?.screenName
    }`;
  }

  return seoTags;
};
