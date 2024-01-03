import Skeleton from '@mui/material/Skeleton';
import React, {useState} from 'react';
import {LazyLoadImage} from 'react-lazy-load-image-component';

interface Props {
  src: string;
  alt: string;
  className: string;
  onClick?: () => void;
}

const NftImage = ({src, alt, className, onClick}: Props) => {
  const [isBroken, setIsBroken] = useState(false);

  const handleError = () => {
    setIsBroken(true);
  };

  return !isBroken ? (
    <LazyLoadImage
      alt={alt}
      src={src}
      className={className}
      onClick={onClick}
      onError={handleError}
    />
  ) : (
    <Skeleton
      className={className}
      variant="rectangular"
      animation="wave"
      width="100%"
      height="100%"
    />
  );
};

export default NftImage;
