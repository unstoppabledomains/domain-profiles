import {useState} from 'react';

import {getDomainNfts} from '../../actions';
import type {Nft, NftMintItem, NftResponse} from '../../lib';
import {notifyError} from '../../lib/error';

export enum NftTag {
  All = 'all',
  Award = 'award',
  DAO = 'dao',
  Deed = 'land',
  Developer = 'developer',
  Domain = 'domain',
  Education = 'education',
  Gaming = 'gaming',
  Hidden = 'hidden',
  Ticket = 'ticket',
  Sustainability = 'sustainability',
  Wearable = 'wearable',
}

interface Props {
  domain: string;
  isOwner: boolean;
  nfts: Nft[];
  nftSymbolVisible: Record<string, boolean | undefined>;
  records?: Record<string, NftResponse>;
  profileServiceUrl: string;
  itemsToUpdate: NftMintItem[];
  setIsAllNftsLoaded: (value: boolean) => void;
  setNftDataLoading: (value: boolean) => void;
  setItemsToUpdate: (value: NftMintItem[]) => void;
  setRecords: (value: Record<string, NftResponse>) => void;
  setNfts: (value: Nft[]) => void;
  setNftSymbolVisible: (value: Record<string, boolean | undefined>) => void;
  setTokenCount: (value: number) => void;
}

export const getNextNftPageFn = (
  props: Props,
): ((reset?: boolean) => Promise<void>) => {
  const [nftCursors, setNftCursors] = useState<
    Record<string, string | undefined>
  >({});

  const handleNextNftPage = async (reset = false) => {
    // reset the NFT gallery state on request
    if (reset) {
      props.nfts.length = 0;
      props.setNfts([]);
      props.setTokenCount(0);
      props.itemsToUpdate.length = 0;
      props.setItemsToUpdate([]);
      Object.keys(props.nftSymbolVisible).forEach(key => {
        delete props.nftSymbolVisible[key];
      });
      props.setNftSymbolVisible({});
    }

    const newNfts: Nft[] = [];
    if (props.nfts.length === 0) {
      // retrieve NFTs from all chains for the first time
      const allSymbols = await getNftData();
      if (!allSymbols || Object.keys(allSymbols).length === 0) {
        return;
      }
      props.setRecords(allSymbols);
      Object.keys(allSymbols)
        .sort()
        .forEach(symbol => {
          if (allSymbols[symbol].nfts.length === 0) {
            return;
          }
          allSymbols[symbol].nfts.forEach(nft => {
            nft.symbol = symbol;
            nft.verified = allSymbols[symbol].verified;
            nft.owner = props.isOwner;
            nft.toggleVisibility = handleNftVisibilityToggle;
          });
          newNfts.push(...allSymbols[symbol].nfts);
          nftCursors[symbol] = allSymbols[symbol].cursor;
          props.nftSymbolVisible[symbol] = allSymbols[symbol].verified;
        });
      setNftCursors(nftCursors);
      props.setNftSymbolVisible(props.nftSymbolVisible);
    } else {
      for (const symbol of Object.keys(nftCursors).sort()) {
        const cursor = nftCursors[symbol];
        if (!cursor) {
          continue;
        }
        const symbolNfts = await getNftData(symbol, cursor);
        if (!symbolNfts || Object.keys(symbolNfts).length === 0) {
          return;
        }
        if (symbolNfts[symbol].nfts) {
          symbolNfts[symbol].nfts.forEach(nft => {
            nft.symbol = symbol;
            nft.verified = symbolNfts[symbol].verified;
            nft.owner = props.isOwner;
            nft.toggleVisibility = handleNftVisibilityToggle;
          });
          newNfts.push(...symbolNfts[symbol].nfts);
        }
        if (symbolNfts[symbol].cursor) {
          nftCursors[symbol] = symbolNfts[symbol].cursor;
        }
      }
    }
    newNfts.forEach(nft => {
      if (!nft.tags) {
        nft.tags = [];
      }
      if (nft.symbol) nft.tags.push(nft.symbol);
      if (nft.public) nft.tags.push(NftTag.All);
    });
    const newNftsFiltered = removeDuplicates(
      newNfts
        .filter(
          newNft =>
            isImageUrl(newNft.image_url) || isImageUrl(newNft.video_url),
        )
        .filter(newNft => newNft.mint)
        .filter(
          newNft => !props.nfts.map(nft => nft.mint).includes(newNft.mint),
        ),
    );
    props.setIsAllNftsLoaded(newNftsFiltered.length === 0);
    props.setNfts([...props.nfts, ...newNftsFiltered]);
  };

  // handleNftVisibilityToggle toggles at items visibility value
  const handleNftVisibilityToggle = (
    symbol: string,
    mint: string,
    visible: boolean,
  ) => {
    props.itemsToUpdate.push({
      symbol,
      mint,
      public: visible,
    });
    props.setItemsToUpdate([...props.itemsToUpdate]);
  };

  // removes NFTs that already exist on the same blockchain
  function removeDuplicates(allNfts: Nft[]): Nft[] {
    const uniqueNfts: Nft[] = [];
    allNfts.forEach(allNft => {
      const existingNfts = uniqueNfts.filter(
        uniqueNft =>
          uniqueNft.symbol === allNft.symbol && uniqueNft.name === allNft.name,
      );
      if (existingNfts.length === 0) {
        uniqueNfts.push(allNft);
      }
    });
    return uniqueNfts;
  }

  const isImageUrl = (url?: string): boolean => {
    try {
      if (url?.toLowerCase().startsWith('https://')) {
        return true;
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to parse url'}, 'warning');
    }
    return false;
  };

  const getNftData = async (
    symbols?: string,
    cursor?: string,
  ): Promise<Record<string, NftResponse> | undefined> => {
    try {
      props.setNftDataLoading(true);
      return await getDomainNfts(props.domain, symbols, cursor);
    } catch (e) {
      notifyError(e, {msg: 'error retrieving NFT data'});
    } finally {
      props.setNftDataLoading(false);
    }
    return undefined;
  };
  return handleNextNftPage;
};
