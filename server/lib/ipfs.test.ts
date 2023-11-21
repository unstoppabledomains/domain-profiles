import {normalizeIpfsHash} from './ipfs';

describe('IPFS', () => {
  it('should add /ipfs prefix to plain hash', () => {
    const normalizedHash = normalizeIpfsHash('someHash');
    expect(normalizedHash).toBe('/ipfs/someHash');
  });

  it('should add /ipfs prefix to hash with path', () => {
    const normalizedHash = normalizeIpfsHash('someHash/file.txt');
    expect(normalizedHash).toBe('/ipfs/someHash/file.txt');
  });

  it('should retain existing /ipfs prefix', () => {
    const normalizedHash = normalizeIpfsHash('/ipfs/someHash');
    expect(normalizedHash).toBe('/ipfs/someHash');
  });

  it('should retain existing /ipns prefix', () => {
    const normalizedHash = normalizeIpfsHash('/ipns/someHash');
    expect(normalizedHash).toBe('/ipns/someHash');
  });
});
