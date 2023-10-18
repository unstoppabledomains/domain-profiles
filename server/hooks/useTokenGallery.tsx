import {TokenGalleryContext} from 'providers/TokenGalleryProvider';
import {useContext} from 'react';

const useTokenGallery = () => {
  const {
    expanded,
    nfts,
    nftSymbolVisible,
    setExpanded,
    setNfts,
    setNftSymbolVisible,
  } = useContext(TokenGalleryContext);
  if (!setExpanded || !setNfts || !setNftSymbolVisible) {
    throw new Error(
      'Expected useTokenGallery to be called within <TokenGalleryProvider />',
    );
  }
  return {
    expanded,
    nfts,
    nftSymbolVisible,
    setExpanded,
    setNfts,
    setNftSymbolVisible,
  };
};

export default useTokenGallery;
