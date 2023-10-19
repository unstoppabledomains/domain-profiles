import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import HomePage from './index.page';

describe('Index page', () => {
  it('should display the render time', async () => {
    render(<HomePage renderTime="test-time" />);
    await waitFor(() => {
      expect(screen.getByText('Render at test-time')).toBeInTheDocument();
    });
  });
});
