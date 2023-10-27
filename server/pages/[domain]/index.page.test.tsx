import {screen, waitFor} from '@testing-library/react';
import React from 'react';
import {customRender} from 'tests/test-utils';

import type {DomainBadgesResponse} from '@unstoppabledomains/ui-components';
import {PersonaInquiryStatus} from '@unstoppabledomains/ui-components';
import * as badgeActions from '@unstoppabledomains/ui-components/src/actions/badgeActions';
import * as domainActions from '@unstoppabledomains/ui-components/src/actions/domainActions';
import * as domainProfileActions from '@unstoppabledomains/ui-components/src/actions/domainProfileActions';
import * as featureFlagActions from '@unstoppabledomains/ui-components/src/actions/featureFlagActions';
import * as identityActions from '@unstoppabledomains/ui-components/src/actions/identityActions';

import type {DomainProfilePageProps} from './index.page';
import DomainProfile from './index.page';

const defaultProps: DomainProfilePageProps = {
  domain: 'foo.crypto',
  profileData: {
    profile: {
      displayName: 'Moonsavage',
      description: 'A savage going to the moon',
      location: 'moon',
      web2Url: 'http://moonsavage.com',
      imagePath: 'http://url.com',
      domainPurchased: true,
      showDomainSuggestion: true,
      showFeaturedCommunity: false,
      showFeaturedPartner: false,
      tokenGalleryEnabled: false,
    },
    social: {
      followerCount: 0,
      followingCount: 0,
    },
    socialAccounts: {
      twitter: {
        location: 'foo',
        verified: true,
        public: true,
      },
      discord: {
        location: 'foo',
        verified: true,
        public: false,
      },
      youtube: {
        location: 'foo',
        verified: true,
        public: false,
      },
      telegram: {
        location: 'foo',
        verified: true,
        public: false,
      },
      reddit: {
        location: 'foo',
        verified: true,
        public: false,
      },
      github: {
        location: 'foo',
        verified: true,
        public: false,
      },
      linkedin: {
        location: 'foo',
        verified: true,
        public: false,
      },
      google: {
        location: 'foo@gmail.com',
        verified: true,
        public: false,
      },
      lens: {
        location: 'foo',
        verified: true,
        public: false,
      },
    },
  },
  records: {
    'whois.email.value': 'user@test.com',
    'whois.for_sale.value': 'true',
    'ipfs.html.value': '0x12345678901234567890',
  },
  metadata: {
    blockchain: 'MATIC',
    owner: '0xcd0dadab45baf9a06ce1279d1342ecc3f44845af',
    tokenId: '0x1234',
    domain: 'foo.crypto',
    namehash: '0x1234',
    registry: '0x1234',
    resolver: '0x1234',
  },
};

const defaultBadges: DomainBadgesResponse = {
  countActive: 1,
  countTotal: 1,
  list: [
    {
      active: true,
      name: 'Foo Badge',
      code: 'foo-badge',
      description: 'description',
      logo: 'https://logo.png',
      linkUrl: 'https://link/to/badge',
      configId: 0,
      expired: false,
      type: 'badges',
      count: 3,
      gallery: {
        enabled: true,
        tier: 3,
      },
    },
  ],
  badgesLastSyncedAt: new Date(),
};

describe('<DomainProfile />', () => {
  beforeEach(() => {
    jest
      .spyOn(domainActions, 'getDomainBadges')
      .mockResolvedValue(defaultBadges);
    jest.spyOn(badgeActions, 'getBadge').mockResolvedValue({
      badge: defaultBadges.list[0],
      sponsorship: {
        max: 1,
        count: 1,
      },
      usage: {
        holders: 100,
      },
    });
    jest
      .spyOn(domainActions, 'getReverseResolution')
      .mockResolvedValue('foo.crypto');
    jest.spyOn(domainProfileActions, 'getFollowers').mockResolvedValue({
      data: [{domain: 'follower1.crypto'}],
      meta: {
        total_count: 1,
        pagination: {
          cursor: 0,
          take: 1,
        },
      },
      relationship_type: 'followers',
      domain: 'foo.crypto',
    });
    jest
      .spyOn(domainProfileActions, 'getProfileData')
      .mockResolvedValue(defaultProps.profileData!);
    jest
      .spyOn(featureFlagActions, 'fetchFeatureFlags')
      .mockResolvedValue(featureFlagActions.DEFAULT_FEATURE_FLAGS);
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should display a basic domain profile page', async () => {
    customRender(<DomainProfile {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('mainContentContainer')).toBeInTheDocument();
    });
  });
});
