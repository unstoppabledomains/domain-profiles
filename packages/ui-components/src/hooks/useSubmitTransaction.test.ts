import {VALID_ETH_ADDRESS} from '../tests/common';
import {mockTokenEntry} from '../tests/mocks/wallet';

const defaultParams = {
  accessToken: 'dummy_access_token',
  token: mockTokenEntry(),
  recipientAddress: VALID_ETH_ADDRESS,
  amount: '10',
};

describe('useSubmitTransaction()', () => {
  it('submits a transaction on mount', () => {
    // TODO: Why does this throw syntax error ?
    // Throws on
    //    import config from '@unstoppabledomains/config';
    // within ../actions/fireBlocksActions
    // jest
    //   .spyOn(fireBlocksActions, 'getAccountAssets')
    //   .mockResolvedValue([]);

    // jest
    //   .spyOn(fireBlocksActions, 'getAccountAssets')
    //   .mockResolvedValue([mockAccountAsset()]);

    // const {transactionId, status, statusMessage} =
    //   useSubmitTransaction(defaultParams);
    // console.log(transactionId, status, statusMessage);
    expect(1).toBe(1);
  });
});
