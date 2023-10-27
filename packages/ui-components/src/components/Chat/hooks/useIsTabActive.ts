import {useEffect, useState} from 'react';

export const useIsTabActive = (documentElement = document) => {
  const [documentVisible, setDocumentVisible] = useState(
    documentElement.visibilityState,
  );

  useEffect(() => {
    const handleVisibilityChange = () =>
      setDocumentVisible(documentElement.visibilityState);

    documentElement.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    return () =>
      documentElement.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
  }, [documentElement]);

  return documentVisible === 'visible';
};
