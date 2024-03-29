import Box from '@mui/material/Box';
import type {ReactNode} from 'react';
import React from 'react';

export type CopyModule = {default: (text: string) => Promise<void>};

export const noop = () => {};

const CopyToClipboard = ({
  onCopy = noop,
  stringToCopy,
  children,
}: {
  onCopy?: () => void;
  stringToCopy: string;
  children: ReactNode;
}) => {
  return (
    <Box
      component="div"
      display="inline"
      aria-label="Copy to clipboard"
      onClick={() => {
        void (import('clipboard-copy') as Promise<CopyModule>).then(
          (mod: CopyModule) => {
            mod.default(stringToCopy).then(onCopy).catch(noop);
          },
        );
      }}
    >
      {children}
    </Box>
  );
};

export default CopyToClipboard;
