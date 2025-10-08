import {screen, waitFor} from '@testing-library/react';
import React from 'react';

import {customRender} from '../../tests/test-utils';
import {DomainPreview} from './DomainPreview';

describe('<DomainPreview />', () => {
  it('should render a standard domain preview avatar', async () => {
    customRender(<DomainPreview domain="foo.crypto" size={100} />);
    await waitFor(() => {
      expect(screen.getByTestId('domain-preview-main-img')).toBeInTheDocument();
      const avatarImg = screen.getByRole('img');
      expect(avatarImg).toHaveProperty('src');
      expect(avatarImg.getAttribute('src')).toContain(
        'https://api.ud-staging.com/metadata/image-src/foo.crypto?withOverlay=false',
      );
    });
  });

  it('should render an ENS domain preview avatar', async () => {
    customRender(<DomainPreview domain="foo.eth" size={100} />);
    await waitFor(() => {
      expect(screen.getByTestId('domain-preview-main-img')).toBeInTheDocument();
      const avatarImg = screen.getByRole('img');
      expect(avatarImg).toHaveProperty(
        'src',
        'https://storage.googleapis.com/unstoppable-client-assets/images/domains/ens-logo.svg',
      );
    });
  });

  it('should render a Web2 domain preview avatar', async () => {
    customRender(<DomainPreview domain="foo.com" size={100} />);
    await waitFor(() => {
      expect(screen.getByTestId('domain-preview-main-img')).toBeInTheDocument();
      const avatarImg = screen.getByRole('img');
      expect(avatarImg).toHaveProperty(
        'src',
        'https://storage.googleapis.com/unstoppable-client-assets/images/domains/dns-logo.svg',
      );
    });
  });
});
