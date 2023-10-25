import React, {useEffect} from 'react';

import config from '@unstoppabledomains/config';

const HomePage = () => {
  // redirect to the Unstoppable Domains homepage until a UD.me specific
  // landing page is created
  useEffect(() => {
    if (!window.location.href.includes(config.UNSTOPPABLE_WEBSITE_URL)) {
      window.location.href = config.UNSTOPPABLE_WEBSITE_URL;
    }
  }, []);

  return <div></div>;
};

export default HomePage;
