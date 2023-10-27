import React from 'react';
import {LazyLoadImage} from 'react-lazy-load-image-component';

interface Props {
  src: string;
  alt: string;
  className: string;
  onClick?: () => void;
}

const NftImage = ({src, alt, className, onClick}: Props) => {
  return (
    <LazyLoadImage
      src={src}
      className={className}
      onClick={onClick}
      alt={alt}
    />
  );
};

export default NftImage;
