export const erc721Abi = [
  {
    inputs: [
      {name: 'from', type: 'address'},
      {name: 'to', type: 'address'},
      {name: 'tokenId', type: 'uint256'},
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
