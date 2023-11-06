import React, {useState} from 'react';

import type {Nft} from '../lib';
import BaseProvider from './BaseProvider';

type Props = {
  children: React.ReactNode;
};

export const TokenGalleryContext = React.createContext<{
  nfts?: Nft[];
  setNfts?: (v: Nft[]) => void;
  nftSymbolVisible?: Record<string, boolean | undefined>;
  setNftSymbolVisible?: (v: Record<string, boolean | undefined>) => void;
  expanded?: boolean;
  setExpanded?: (v: boolean) => void;
}>({});

const TokenGalleryProvider: React.FC<Props> = ({children}) => {
  const [expanded, setExpanded] = useState(false);
  const [nfts, setNfts] = useState([] as Nft[]);
  const [nftSymbolVisible, setNftSymbolVisible] = useState<
    Record<string, boolean | undefined>
  >({});

  const value = {
    nfts,
    setNfts,
    expanded,
    setExpanded,
    nftSymbolVisible,
    setNftSymbolVisible,
  };

  return (
    <BaseProvider>
      <TokenGalleryContext.Provider value={value}>
        {children}
      </TokenGalleryContext.Provider>
    </BaseProvider>
  );
};

export default TokenGalleryProvider;
