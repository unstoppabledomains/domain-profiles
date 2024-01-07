import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {customRender} from 'tests/test-utils';

import type {
  DomainBadgesResponse,
  SerializedPublicDomainProfileData,
} from '@unstoppabledomains/ui-components';
import {
  DomainProfileKeys,
  PersonaInquiryStatus,
} from '@unstoppabledomains/ui-components';
import * as badgeActions from '@unstoppabledomains/ui-components/src/actions/badgeActions';
import * as domainActions from '@unstoppabledomains/ui-components/src/actions/domainActions';
import * as domainProfileActions from '@unstoppabledomains/ui-components/src/actions/domainProfileActions';
import * as featureFlagActions from '@unstoppabledomains/ui-components/src/actions/featureFlagActions';
import * as identityActions from '@unstoppabledomains/ui-components/src/actions/identityActions';
import * as push from '@unstoppabledomains/ui-components/src/components/Chat/protocol/push';
import * as chatStorage from '@unstoppabledomains/ui-components/src/components/Chat/storage';
import * as nftImage from '@unstoppabledomains/ui-components/src/components/TokenGallery/NftImage';

import type {DomainProfilePageProps} from './index.page';
import DomainProfile from './index.page';

const defaultProps = (): DomainProfilePageProps => {
  return {
    domain: 'foo.crypto',
    profileData: {
      profile: {
        displayName: 'Moonsavage',
        description: 'A savage going to the moon',
        location: 'moon',
        web2Url: 'http://moonsavage.com',
        publicDomainSellerEmail: 'seller@gmail.com',
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
        lens: {
          location: 'foo',
          verified: true,
          public: false,
        },
      },
    },
  };
};

const defaultRecords = () => {
  return {
    records: {
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
};

const defaultProfileData = (): SerializedPublicDomainProfileData => {
  return {
    ...defaultProps().profileData!,
    ...defaultRecords(),
  };
};

const defaultTokenGalleryData = (): SerializedPublicDomainProfileData => {
  return {
    ...defaultProfileData(),
    records: {
      'crypto.ETH.address': 'test-eth-address',
      'crypto.SOL.address': 'test-sol-address',
    },
    cryptoVerifications: [
      {
        id: 0,
        symbol: 'ETH',
        address: 'test-eth-address',
        plaintextMessage: 'message',
        signedMessage: 'signature',
      },
    ],
  };
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
      marketplace: {
        floorPrice: {
          currency: 'ETH',
          value: 1,
        },
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
      .mockResolvedValue(defaultProfileData());
    jest
      .spyOn(featureFlagActions, 'fetchFeatureFlags')
      .mockResolvedValue(featureFlagActions.DEFAULT_FEATURE_FLAGS);
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  it('should display a basic domain profile page', async () => {
    customRender(<DomainProfile {...defaultProps()} />);
    await waitFor(() => {
      expect(screen.getByTestId('mainContentContainer')).toBeInTheDocument();
    });
  });

  it('renders a share menu button', async () => {
    customRender(<DomainProfile {...defaultProps()} />);
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Share'})).toBeInTheDocument();
    });
  });

  it('renders display name, domain name, description, location, email, profile image, web3 site, for sale block', async () => {
    customRender(<DomainProfile {...defaultProps()} />);

    await waitFor(() => {
      const infoExpandButton = screen.getByTestId('expand-moreInfo');
      expect(infoExpandButton).toBeInTheDocument();
      userEvent.click(infoExpandButton);
    });

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', {name: 'seller@gmail.com'}),
      ).toHaveLength(1);
      expect(
        screen.getByText('A savage going to the moon'),
      ).toBeInTheDocument();
      expect(screen.getByText('moon')).toBeInTheDocument();
      expect(
        screen.getByText('foo.crypto (0x12345678...7890)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('This domain is listed for sale'),
      ).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByAltText('Domain profile image')).toBeInTheDocument();
    });
  });

  it('does not render featured partners when disabled', async () => {
    const props = defaultProps();
    props.profileData!.profile = {
      showDomainSuggestion: false,
      showFeaturedCommunity: false,
      showFeaturedPartner: false,
    };
    customRender(<DomainProfile {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Badges')).toBeInTheDocument();
    });
    expect(() => screen.getByText('Featured Partner')).toThrow();
  });

  it('renders social account cards', async () => {
    customRender(<DomainProfile {...defaultProps()} />);

    await waitFor(() => {
      expect(screen.getByTitle('twitter logo')).toBeInTheDocument();
      expect(screen.getByTitle('reddit logo')).toBeInTheDocument();
      expect(screen.getByTitle('youtube logo')).toBeInTheDocument();
    });
  });

  it('shows empty case if the domain not minted', async () => {
    const props = defaultProps();
    props.profileData = null;

    jest.spyOn(domainProfileActions, 'getProfileData').mockResolvedValue({
      ...defaultProfileData(),
      records: {},
      metadata: {},
    });
    jest.spyOn(domainActions, 'getDomainBadges').mockResolvedValue({
      countActive: 0,
      countTotal: 0,
      list: [],
      badgesLastSyncedAt: new Date(),
    });

    customRender(<DomainProfile {...props} />);

    await waitFor(() => {
      expect(
        screen.getByText("The domain is purchased but isn't minted yet."),
      ).toBeInTheDocument();
    });
  });

  it('renders a crypto address', async () => {
    const props = defaultProps();

    jest.spyOn(domainProfileActions, 'getProfileData').mockResolvedValue({
      ...defaultProfileData(),
      records: {
        'crypto.ETH.address': '0x82fb235d3338c5583512f2065555dc18fe13a12b',
      },
    });

    customRender(<DomainProfile {...props} />);

    await waitFor(() => {
      const addressExpandButton = screen.getByTestId('expand-addresses');
      expect(addressExpandButton).toBeInTheDocument();
      userEvent.click(addressExpandButton);
    });

    await waitFor(() => {
      expect(screen.getByText('0x82...a12b')).toBeInTheDocument();
    });
  });
});

describe('Token gallery for multiple blockchains', () => {
  const tokenGalleryProps = defaultProps();
  tokenGalleryProps.profileData!.profile!.tokenGalleryEnabled = true;

  beforeEach(async () => {
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
      .spyOn(featureFlagActions, 'fetchFeatureFlags')
      .mockResolvedValue(featureFlagActions.DEFAULT_FEATURE_FLAGS);
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });

    // mock profile with token gallery enabled
    jest
      .spyOn(domainProfileActions, 'getProfileData')
      .mockResolvedValue(defaultTokenGalleryData());

    // mock NFT data
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name',
            mint: 'test-sol-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-description',
            public: true,
          },
          {
            name: 'test-sol-nft-ticket',
            mint: 'test-sol-nft-ticket',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket'],
            public: true,
          },
          {
            name: 'test-sol-nft-hidden',
            mint: 'test-sol-nft-hidden',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket', 'hidden'],
            public: false,
          },
        ],
      },
      ['ETH']: {
        address: 'test-eth-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-eth-nft-name',
            mint: 'test-eth-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-eth-collection',
            description: 'test-nft-description',
            public: true,
          },
        ],
      },
    });

    // mock the lazy load image component due to incompatibilities with jest
    jest
      .spyOn(nftImage, 'default')
      .mockReturnValue(
        <img src="https://test-nft-jpg" alt="test-sol-nft-name"></img>,
      );

    // render the page and wait for load
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('mainContentContainer')).toBeInTheDocument();
    });
  });

  it('should display the token gallery carousel if NFTs available', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
    });
    // display all 3 public NFTs (the 4th is private)
    expect(screen.getAllByTestId('swiper-slide-testid')).toHaveLength(3);
  });

  it('renders the show all button', async () => {
    expect(() => screen.getByText('nftGallery-infinite-scroll')).toThrow();
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();
  });

  it('renders the token count when show all button is clicked', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);
    expect(screen.getByTestId('token-count')).toBeInTheDocument();
  });

  it('renders the token count when show all button is clicked and hides when collapse', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);
    expect(screen.getByTestId('token-count')).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);
    expect(() => screen.getByText('token-count')).toThrow();
  });

  it('shows infinite scroll when show all clicked', async () => {
    expect(() => screen.getByText('nftGallery-infinite-scroll')).toThrow();
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);
    expect(
      screen.getByTestId('nftGallery-infinite-scroll'),
    ).toBeInTheDocument();
    expect(() => screen.getByText('swiper-testid')).toThrow();
  });

  it('hides infinite scroll when collapse clicked', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);
    expect(
      screen.getByTestId('nftGallery-infinite-scroll'),
    ).toBeInTheDocument();

    // click collapse
    userEvent.click(showAll);
    expect(() => screen.getByText('nftGallery-infinite-scroll')).toThrow();
    expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
  });

  it('should only render clear all button if filter selected', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);

    // ensure button hidden
    expect(() => screen.getByTestId('nftGallery-filter-clear')).toThrow();

    // click category menu
    const categoryFilter = screen.getByTestId('nftGallery-filter-tag');
    userEvent.click(categoryFilter);

    // click the ticket filter
    const ticketOption = screen.getByTestId('nftGallery-filter-tag-ticket');
    userEvent.click(ticketOption);

    // ensure button shown
    expect(screen.getByTestId('nftGallery-filter-clear')).toBeInTheDocument();
  });

  it('should not render the hidden tag in category menu', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);

    // click category menu
    const categoryFilter = screen.getByTestId('nftGallery-filter-tag');
    userEvent.click(categoryFilter);

    // make sure the hidden option is not present
    expect(() => screen.getByTestId('nftGallery-filter-tag-hidden')).toThrow();
  });

  it('clicking clear all button removes existing filters', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);

    // all NFT visible by default
    await waitFor(() => {
      expect(screen.getAllByText('test-sol-nft-name').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('test-sol-nft-ticket').length).toBeGreaterThan(
        0,
      );
    });

    // click category menu
    const categoryFilter = screen.getByTestId('nftGallery-filter-tag');
    userEvent.click(categoryFilter);

    // click the ticket filter
    const ticketOption = screen.getByTestId('nftGallery-filter-tag-ticket');
    userEvent.click(ticketOption);

    // check for only ticket NFT shown
    expect(() => screen.getByText('test-sol-nft-name')).toThrow();

    // click clear button
    const clearBtn = screen.getByTestId('nftGallery-filter-clear');
    userEvent.click(clearBtn);

    // check for both available NFTs
    expect(screen.getAllByText('test-sol-nft-name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('test-sol-nft-ticket').length).toBeGreaterThan(
      0,
    );
  });

  it('clicking non-all filter shows only related images', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();

    // click show all
    userEvent.click(showAll);

    // all NFT visible by default
    await waitFor(() => {
      expect(screen.getAllByText('test-sol-nft-name').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('test-sol-nft-ticket').length).toBeGreaterThan(
        0,
      );
    });

    // click ticket in the category menu
    const categoryFilter = screen.getByTestId('nftGallery-filter-tag');
    userEvent.click(categoryFilter);
    const ticketOption = screen.getByTestId('nftGallery-filter-tag-ticket');
    userEvent.click(ticketOption);

    // check for only ticket NFT shown
    expect(() => screen.getByText('test-sol-nft-name')).toThrow();
    expect(screen.getAllByText('test-sol-nft-ticket').length).toBeGreaterThan(
      0,
    );

    // click ETH in the chain menu
    const symbolFilter = screen.getByTestId('nftGallery-filter-symbol');
    userEvent.click(symbolFilter);
    const ethOption = screen.getByTestId('nftGallery-filter-symbol-ETH');
    userEvent.click(ethOption);

    // check that Solana ticket now hidden
    expect(() => screen.getByText('test-sol-nft-ticket')).toThrow();
  });
});

describe('Token gallery for single blockchain', () => {
  const tokenGalleryProps = defaultProps();
  tokenGalleryProps.profileData!.profile!.tokenGalleryEnabled = true;

  beforeEach(async () => {
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
      .spyOn(featureFlagActions, 'fetchFeatureFlags')
      .mockResolvedValue(featureFlagActions.DEFAULT_FEATURE_FLAGS);
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });

    // mock profile with token gallery enabled
    jest
      .spyOn(domainProfileActions, 'getProfileData')
      .mockResolvedValue(defaultTokenGalleryData());

    // mock NFT data
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name',
            mint: 'test-sol-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-description',
            public: true,
          },
          {
            name: 'test-sol-nft-ticket',
            mint: 'test-sol-nft-ticket',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket'],
            public: true,
          },
          {
            name: 'test-sol-nft-hidden',
            mint: 'test-sol-nft-hidden',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket', 'hidden'],
            public: false,
          },
        ],
      },
    });

    // mock the lazy load image component due to incompatibilities with jest
    jest
      .spyOn(nftImage, 'default')
      .mockReturnValue(
        <img src="https://test-nft-jpg" alt="test-sol-nft-name"></img>,
      );

    // render the page and wait for load
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('mainContentContainer')).toBeInTheDocument();
    });
  });

  it('should display the token gallery carousel if NFTs available', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
    });
    // display all 2 public NFTs (the 3rd is private)
    expect(screen.getAllByTestId('swiper-slide-testid')).toHaveLength(2);
  });

  it('should hide blockchain filters', async () => {
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();
    userEvent.click(showAll);

    // ensure the category filter is present
    const allFilter = screen.getByTestId('nftGallery-filter-tag');
    expect(allFilter).toBeInTheDocument();

    // ensure the symbol drop down filter is hidden
    expect(() => screen.getByTestId('nftGallery-filter-symbol')).toThrow();
  });
});

describe('Token gallery carousel', () => {
  const tokenGalleryProps = defaultProps();
  tokenGalleryProps.profileData!.profile!.tokenGalleryEnabled = true;

  beforeEach(async () => {
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
      .spyOn(featureFlagActions, 'fetchFeatureFlags')
      .mockResolvedValue(featureFlagActions.DEFAULT_FEATURE_FLAGS);
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });

    // mock profile with token gallery enabled
    jest
      .spyOn(domainProfileActions, 'getProfileData')
      .mockResolvedValue(defaultTokenGalleryData());

    // mock NFT data
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name',
            mint: 'test-sol-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-description',
            public: true,
          },
          {
            name: 'test-sol-nft-ticket',
            mint: 'test-sol-nft-ticket',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket'],
            public: true,
          },
          {
            name: 'test-sol-nft-hidden',
            mint: 'test-sol-nft-hidden',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket', 'hidden'],
            public: false,
          },
        ],
      },
      ['ETH']: {
        address: 'test-eth-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-eth-nft-name',
            mint: 'test-eth-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-eth-collection',
            description: 'test-nft-description',
            public: true,
          },
        ],
      },
    });

    // mock the lazy load image component due to incompatibilities with jest
    jest
      .spyOn(nftImage, 'default')
      .mockReturnValue(
        <img src="https://test-nft-jpg" alt="test-sol-nft-name"></img>,
      );
  });

  it('renders the NFT carousel loader if no data is available', async () => {
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({});
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('nft-carousel-loader')).toBeInTheDocument();
    });
  });

  it('renders the NFT carousel with additional NFT page if required', async () => {
    // mock two pages of NFT data response
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValueOnce({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name1',
            mint: 'test-sol-nft-name1',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: false,
            verified: true,
          },
          {
            name: 'test-sol-nft-name2',
            mint: 'test-sol-nft-name2',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: false,
            verified: true,
          },
          {
            name: 'test-sol-nft-name3',
            mint: 'test-sol-nft-name3',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
        ],
      },
    });
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValueOnce({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name4',
            mint: 'test-sol-nft-name4',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
          {
            name: 'test-sol-nft-name5',
            mint: 'test-sol-nft-name5',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
          {
            name: 'test-sol-nft-name6',
            mint: 'test-sol-nft-name6',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
        ],
      },
    });

    // render the page
    customRender(<DomainProfile {...tokenGalleryProps} />);

    // verify the public NFTs across the two pages are visible on page
    await waitFor(() => {
      expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
      expect(screen.getAllByText('test-sol-nft-name3').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('test-sol-nft-name4').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('test-sol-nft-name5').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('test-sol-nft-name6').length).toBeGreaterThan(
        0,
      );
    });

    // validate the loader is hidden
    expect(() => screen.getByTestId('nft-carousel-loader')).toThrow();
  });

  it('only renders a single instance of an NFT if duplicates are found', async () => {
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValueOnce({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name1',
            mint: 'test-sol-nft-name1',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
          {
            name: 'test-sol-nft-name1',
            mint: 'test-sol-nft-name1',
            link: 'test-nft-link',
            video_url: '',
            collection: 'test-sol-collection',
            image_url: 'https://test-nft-jpg',
            description: 'test-nft-description',
            public: true,
            verified: true,
          },
        ],
      },
    });

    // render the page
    customRender(<DomainProfile {...tokenGalleryProps} />);

    // wait for the carousel to load
    await waitFor(() => {
      expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
    });

    // validate only a single element is shown
    expect(screen.getAllByText('test-sol-nft-name1')).toHaveLength(1);
  });

  it('skips invalid image files', async () => {
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValueOnce({
      ['MATIC']: {
        verified: true,
        enabled: true,
        cursor: '1',
        address: 'matic-address',
        nfts: [
          {
            name: 'test-matic-nft-name',
            mint: 'test-matic-nft-name',
            link: 'test-nft-link',
            image_url: 'invalid-jpg',
            video_url: '',
            collection: 'test-collection',
            description: 'test-nft-description',
            verified: true,
            public: false,
          },
        ],
      },
    });

    // render the page
    customRender(<DomainProfile {...tokenGalleryProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('mainContentContainer')).toBeInTheDocument();
    });
    expect(() => screen.getByText('test-matic-nft-name')).toThrow();
  });
});

describe('Owner operations', () => {
  const tokenGalleryProps = defaultProps();
  tokenGalleryProps.profileData!.profile!.tokenGalleryEnabled = true;

  beforeEach(async () => {
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
    jest.spyOn(featureFlagActions, 'fetchFeatureFlags').mockResolvedValue({
      variations: {
        ...featureFlagActions.DEFAULT_FEATURE_FLAGS.variations!,
        udMeServiceDomainsEnableManagement: true,
      },
    });
    jest.spyOn(identityActions, 'getIdentity').mockResolvedValue({
      id: 'personaId',
      createdAt: Date.now(),
      name: 'foo.crypto',
      status: PersonaInquiryStatus.COMPLETED,
    });

    // mock profile with token gallery enabled
    jest
      .spyOn(domainProfileActions, 'getProfileData')
      .mockResolvedValue(defaultTokenGalleryData());

    // mock NFT data
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name',
            mint: 'test-sol-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-description',
            public: true,
          },
          {
            name: 'test-sol-nft-ticket',
            mint: 'test-sol-nft-ticket',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket'],
            public: true,
          },
          {
            name: 'test-sol-nft-hidden',
            mint: 'test-sol-nft-hidden',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket', 'hidden'],
            public: false,
          },
        ],
      },
      ['ETH']: {
        address: 'test-eth-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-eth-nft-name',
            mint: 'test-eth-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-eth-collection',
            description: 'test-nft-description',
            public: true,
          },
        ],
      },
    });

    // mock the lazy load image component due to incompatibilities with jest
    jest
      .spyOn(nftImage, 'default')
      .mockReturnValue(
        <img src="https://test-nft-jpg" alt="test-sol-nft-name"></img>,
      );

    // mock local storage
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((k: string): string | null => {
        switch (k) {
          case DomainProfileKeys.AuthAddress:
            return defaultProfileData()!.metadata!.owner as string;
          case DomainProfileKeys.AuthDomain:
            return 'foo.crypto';
        }
        return null;
      });
  });

  it('should render the hidden tag in category menu', async () => {
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('swiper-testid')).toBeInTheDocument();
    });

    // click show all
    const showAll = screen.getByTestId('nftGallery-show-all-link');
    expect(showAll).toBeInTheDocument();
    userEvent.click(showAll);

    // click category menu
    expect(screen.getByTestId('nftGallery-filter-tag')).toBeInTheDocument();
    const categoryFilter = screen.getByTestId('nftGallery-filter-tag');
    userEvent.click(categoryFilter);

    // make sure the hidden option is present
    expect(
      screen.getByTestId('nftGallery-filter-tag-hidden'),
    ).toBeInTheDocument();
  });

  it('hides unverified NFTs', async () => {
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'test-sol-address',
        verified: true,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-sol-nft-name',
            mint: 'test-sol-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-description',
            public: true,
          },
          {
            name: 'test-sol-nft-ticket',
            mint: 'test-sol-nft-ticket',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket'],
            public: true,
          },
          {
            name: 'test-sol-nft-hidden',
            mint: 'test-sol-nft-hidden',
            link: 'test-nft-ticket-link',
            image_url: 'https://test-nft-ticket-jpg',
            video_url: '',
            collection: 'test-sol-collection',
            description: 'test-nft-ticket-description',
            tags: ['ticket', 'hidden'],
            public: false,
          },
        ],
      },
      ['ETH']: {
        address: 'test-eth-address',
        verified: false,
        enabled: true,
        cursor: '1',
        nfts: [
          {
            name: 'test-eth-nft-name',
            mint: 'test-eth-nft-name',
            link: 'test-nft-link',
            image_url: 'https://test-nft-jpg',
            video_url: '',
            collection: 'test-eth-collection',
            description: 'test-nft-description',
            public: true,
          },
        ],
      },
    });

    customRender(<DomainProfile {...tokenGalleryProps} />);

    await waitFor(() =>
      expect(screen.getAllByText('test-sol-nft-name').length).toBeGreaterThan(
        0,
      ),
    );
    expect(() => screen.getByText('test-eth-nft-name')).toThrow();
  });

  it('opens first time configuration modal when button clicked', async () => {
    jest.spyOn(domainProfileActions, 'getDomainNfts').mockResolvedValue({
      ['SOL']: {
        address: 'sol-address',
        enabled: false,
        verified: true,
        cursor: '1',
        nfts: [],
      },
    });
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() =>
      expect(
        screen.getByTestId('nftGallery-firstTimeConfigTitle'),
      ).toBeInTheDocument(),
    );
    const configButton = screen.getByTestId('nftGallery-config-button');
    userEvent.click(configButton);
    await waitFor(() =>
      expect(screen.getByTestId('nftGallery-modal-save')).toBeInTheDocument(),
    );
  });

  it('does not render the chat or follow buttons on own domain', async () => {
    customRender(<DomainProfile {...tokenGalleryProps} />);

    // validate only the share button is present
    await waitFor(() => {
      expect(screen.queryByTestId('share-button')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-profile-button')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
    });
  });

  it('initiates Unstoppable Messaging onboarding when chat button clicked', async () => {
    // mock the EPNS endpoints
    const mockGetPushUser = jest
      .spyOn(push, 'getPushUser')
      .mockResolvedValue(undefined);

    // mock XMTP endpoints
    const mockXmtpUser = jest
      .spyOn(chatStorage, 'getXmtpLocalKey')
      .mockReturnValue(undefined);

    // render a domain other than the logged in user domain
    customRender(
      <DomainProfile {...tokenGalleryProps} domain="another.crypto" />,
    );

    // validate all the chat button exists
    await waitFor(() => {
      expect(screen.queryByTestId('header-chat-button')).toBeInTheDocument();
    });

    // validate the push user onboarding mock not yet called
    expect(mockGetPushUser).not.toHaveBeenCalled();
    expect(mockXmtpUser).toHaveBeenCalledTimes(1);

    // click the chat button to kickoff onboarding
    const chatButton = screen.getByTestId('header-chat-button');
    userEvent.click(chatButton);

    // verify the user initialization process started
    await waitFor(() => {
      expect(
        screen.queryByTestId('chat-onboard-modal-save'),
      ).toBeInTheDocument();
    });
  });

  it('renders the featured partner show/hide button', async () => {
    customRender(<DomainProfile {...tokenGalleryProps} />);
    await waitFor(() => {
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Featured Partner')).toBeInTheDocument();
      expect(
        screen.getByTestId('showhide-featuredPartners'),
      ).toBeInTheDocument();
    });
  });
});
