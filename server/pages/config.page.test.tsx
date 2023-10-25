import {screen, waitFor} from '@testing-library/react';
import React from 'react';
import {customRender} from 'tests/test-utils';

import ConfigPage from './config.page';

describe('Index page', () => {
  it('should display the render time', async () => {
    customRender(<ConfigPage renderTime="test-time" />);
    await waitFor(() => {
      expect(screen.getByText('Rendered at test-time')).toBeInTheDocument();
    });
  });
});
