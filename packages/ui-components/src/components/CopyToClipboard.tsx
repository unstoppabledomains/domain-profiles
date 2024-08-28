import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type {MouseEvent, ReactNode} from 'react';
import React from 'react';

import {useTranslationContext} from '../lib';

export type CopyModule = {default: (text: string) => Promise<void>};

export const noop = () => {};

const CopyToClipboard = ({
  onCopy = noop,
  stringToCopy,
  children,
  tooltip,
}: {
  onCopy?: () => void;
  stringToCopy: string;
  children: ReactNode;
  tooltip?: string;
}) => {
  const [t] = useTranslationContext();

  // copy to the clipboard
  const handleCopyClick = async (e: MouseEvent<HTMLElement>) => {
    // stop the event from bubbling up to next handler
    e.stopPropagation();

    // copy the text to clipboard
    await navigator.clipboard.writeText(stringToCopy);

    // option callback
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <Tooltip title={tooltip || t('common.copy')}>
      <Box
        component="div"
        display="inline"
        aria-label={tooltip || t('common.copy')}
        onClick={handleCopyClick}
        zIndex={10000}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export default CopyToClipboard;
