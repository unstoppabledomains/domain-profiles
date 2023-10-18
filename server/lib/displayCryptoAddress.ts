/**
 * Trims long crypto addresses and adds triple dots 3 characters before the end
 * Example:
 * - input: 0x2aec9D5A54976F7d1F2Dc177F5C28F0c95660680
 * - output: 0x2aec9D5A54976F7d1F2Dc177F5C...680
 */
export default function displayCryptoAddress({
  address,
  compact = false,
}: {
  address: string;
  compact?: boolean;
}) {
  const threshold = compact ? 20 : 35;
  const charactersToKeepAtTheEnd = 3;

  return address.length > threshold
    ? address.slice(
        0,
        // -3 for '...'
        Math.min(
          threshold - charactersToKeepAtTheEnd - 3,
          address.length - charactersToKeepAtTheEnd,
        ),
      ) +
        '...' +
        address.slice(-charactersToKeepAtTheEnd)
    : address;
}

export const displayShortCryptoAddress = (
  address: string,
  start = 6,
  end = 4,
) => `${address.slice(0, start)}...${address.slice(-end)}`;
