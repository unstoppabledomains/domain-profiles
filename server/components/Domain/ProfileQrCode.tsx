import type {Theme} from '@mui/material/styles';
import React from 'react';
import {QRCode} from 'react-qrcode-logo';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const encodedUdLogo: string =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyIiBpZD0idWQtbG9nbyIgaGVpZ2h0PSIxNDgiIHZpZXdCb3g9IjAgMCAxNjIgMTQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMC4zMzMzNDQgMTI0LjU3NUwwLjM0MzQyNyAxMjQuNTY3TDAuMzYzNTk0IDEyNC41NTJMMC4zMzMzNDQgMTI0LjU3NUwwLjM5MTMyMyAxMjQuNTMyTDMwLjgxNTYgMTAxLjY0NEMzMC42NjE5IDEwMC4wMzcgMzAuNTgzMyA5OC40MDY4IDMwLjU4MzMgOTYuNzU4NlY1Ni4yOTg5TDYwLjgzMzMgMzkuNjA5MlY3OS4wNTc1TDk2LjEyNSA1Mi41MDU4VjIwLjEzOEwxMzEuNDE3IDAuNjY2Njg3VjI1Ljk1MTVMMTYxLjY2NyAzLjE5NTQyVjguMjUyODlMMTMxLjQxNyAzMC4wNjA3VjM0LjE2OTlMMTYxLjY2NyAxMy4zMTA0VjE4LjM2NzhMMTMxLjQxNyAzOC4yNzkxVjQyLjM4ODNMMTYxLjY2NyAyMy40MjUzVjI4LjQ4MjhMMTMxLjQxNyA0Ni40OTc1VjUwLjYwOTJMMTYxLjY2NyAzMy41NDAzVjM4LjU5NzdMMTMxLjQxNyA1NC43MTg0VjU4LjgyNTFMMTYxLjY2NyA0My42NTUyVjQ4LjcxMjdMMTMxLjQxNyA2Mi45MzQzVjY3LjA0MzVMMTYxLjY2NyA1My43NzAxVjU4LjgyNzZMMTMxLjQxNyA3MS4xNTI3Vjk2Ljc1ODZDMTMxLjQxNyAxMjQuNjkgMTA4Ljg0NCAxNDcuMzMzIDgxIDE0Ny4zMzNDNTguMjIyMiAxNDcuMzMzIDM4Ljk3MjQgMTMyLjE4MSAzMi43MjEyIDExMS4zNzZMMC4zNTM1MSAxMjQuNTY1TDAuMzMzMzQ0IDEyNC41NzVaTTMyLjIxNzggMTA5LjU4MUwwLjM3MzY3NyAxMjQuNTUyTDAuMzYxMDczIDEyNC41NkwzMi40NTkzIDExMC40NzRDMzIuMzc2MiAxMTAuMTc3IDMyLjI5NTcgMTA5Ljg4IDMyLjIxNzggMTA5LjU4MVpNMzEuMTM5MiAxMDQuMjk0TDAuMzkxMzIzIDEyNC41MzJMMC4zNjM1OTQgMTI0LjU1MkwzMS4yNzgyIDEwNS4xNzRDMzEuMjI5MyAxMDQuODgyIDMxLjE4MyAxMDQuNTg4IDMxLjEzOTIgMTA0LjI5NFpNMzEuNzkxMiAxMDcuODEyTDAuNDE0MDEgMTI0LjUzMkwzMS45OTU0IDEwOC42OTRDMzEuOTI0OCAxMDguNDAxIDMxLjg1NjcgMTA4LjEwNyAzMS43OTEyIDEwNy44MTJaTTMwLjkwODEgMTAyLjUzMUwwLjQyOTEzNSAxMjQuNTA2TDMxLjAxNiAxMDMuNDE0QzMwLjk3NzUgMTAzLjEyIDMwLjk0MTUgMTAyLjgyNiAzMC45MDgxIDEwMi41MzFaTTk2LjEyNSA4NS41MzYxTDYxLjA5NSA5OS44MTI3QzYyLjUzNzYgMTA4LjEzMyA2OS43NzE5IDExNC40NiA3OC40NzkyIDExNC40NkM4OC4yMjQ3IDExNC40NiA5Ni4xMjUgMTA2LjUzNSA5Ni4xMjUgOTYuNzU4NlY4NS41MzYxWk05Ni4xMjUgNzkuNTI3OEw2MC44MzMzIDk2LjEyMzlWOTYuNzU4NkM2MC44MzMzIDk3LjE3NjMgNjAuODQ3OCA5Ny41OTA3IDYwLjg3NjEgOTguMDAxMUw5Ni4xMjUgODIuNTMyVjc5LjUyNzhaTTk2LjEyNSA3My41MjcxTDYwLjgzMzMgOTIuMzMzNFY5NC4yMjc0TDk2LjEyNSA3Ni41MjYyVjczLjUyNzFaTTk2LjEyNSA2Ny41MTYzTDYwLjgzMzMgODguNTM3N1Y5MC40MzY4TDk2LjEyNSA3MC41MjNWNjcuNTE2M1pNOTYuMTI1IDYxLjUxMDZMNjAuODMzMyA4NC43NDQ2Vjg2LjY0MTJMOTYuMTI1IDY0LjUxNDdWNjEuNTEwNlpNOTYuMTI1IDU1LjUwNzRMNjAuODMzMyA4MC45NTRWODIuODQ4MUw5Ni4xMjUgNTguNTA5VjU1LjUwNzRaTTAuMzYxMDczIDEyNC41NkwwLjM1MzUxIDEyNC41NjVMMC4zNzM2NzcgMTI0LjU1MkwzMS42MDM1IDEwNi45MzFDMzEuNTQzOSAxMDYuNjM4IDMxLjQ4NjkgMTA2LjM0NSAzMS40MzI0IDEwNi4wNUwwLjM2MzU5NCAxMjQuNTUyTDAuMzUzNTEgMTI0LjU2NUwwLjM0MzQyNyAxMjQuNTY3TDAuMzYxMDczIDEyNC41NloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=';

interface ProfileQrCodeProps {
  className?: string;
  domain: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  profileQrCodeContainer: {
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  container: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  container_mobile: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
}));

const ProfileQrCode = ({className, domain}: ProfileQrCodeProps) => {
  const {classes, cx} = useStyles();
  return (
    <div
      data-testid={'profile-qr-code'}
      className={cx(className, classes.profileQrCodeContainer)}
    >
      <div className={classes.container}>
        <QRCode
          value={`${config.UD_ME_BASE_URL}/${domain}`}
          size={110}
          logoOpacity={0.5}
          logoImage={encodedUdLogo}
          logoHeight={60}
          logoWidth={60}
          qrStyle={'dots'}
          ecLevel={'H'}
          eyeRadius={5}
          style={{innerHeight: 80, innerWidth: 30}}
        />
      </div>
      <div className={classes.container_mobile}>
        <QRCode
          value={`${config.UD_ME_BASE_URL}/${domain}`}
          size={85}
          logoOpacity={0.5}
          logoImage={encodedUdLogo}
          logoHeight={60}
          logoWidth={60}
          qrStyle={'dots'}
          ecLevel={'H'}
          eyeRadius={5}
        />
      </div>
    </div>
  );
};

export default ProfileQrCode;
