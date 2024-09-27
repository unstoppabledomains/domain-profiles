import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

export const useConversationBubbleStyles = makeStyles<{
  isAttachment: boolean;
}>()((theme: Theme, {isAttachment}) => ({
  avatarContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  avatar: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(3.5),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    cursor: 'pointer',
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1),
    position: 'relative',
  },
  msg: {
    overflow: 'hidden',
    padding: theme.spacing(1, 2),
    borderRadius: 4,
    marginBottom: 4,
    display: 'inline-block',
    wordBreak: 'break-word',
  },
  optionsContainer: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(-10),
    position: 'absolute',
    right: 0,
    top: 0,
    display: 'flex',
  },
  emojiContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.white,
    boxShadow: theme.shadows[1],
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    display: 'flex',
    zIndex: 1001,
    right: 0,
    top: 0,
  },
  emoji: {
    margin: theme.spacing(1),
    cursor: 'pointer',
  },
  reactionContainer: {
    display: 'flex',
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    zIndex: 1000,
  },
  reaction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.white,
    borderRadius: '50%',
    marginRight: theme.spacing(-0.5),
    width: '22px',
    height: '22px',
  },
  blockColor: {
    color: theme.palette.error.main,
  },
  optionsIconOn: {
    color: theme.palette.neutralShades[400],
  },
  optionsIconOff: {
    color: theme.palette.white,
  },
  leftRow: {
    position: 'relative',
    display: 'inline-block',
    textAlign: 'left',
  },
  leftMargin: {
    marginRight: theme.spacing(10),
  },
  rightRow: {
    display: 'inline-block',
    textAlign: 'right',
  },
  rightMargin: {
    marginLeft: theme.spacing(10),
  },
  left: {
    borderTopRightRadius: theme.spacing(2.5),
    borderBottomRightRadius: theme.spacing(2.5),
    backgroundColor: isAttachment
      ? theme.palette.common.white
      : theme.palette.grey[100],
  },
  right: {
    borderTopLeftRadius: theme.spacing(2.5),
    borderBottomLeftRadius: theme.spacing(2.5),
    backgroundColor: isAttachment
      ? theme.palette.common.white
      : theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  leftFirst: {
    borderTopLeftRadius: theme.spacing(2.5),
  },
  leftLast: {
    borderBottomLeftRadius: theme.spacing(2.5),
  },
  rightFirst: {
    borderTopRightRadius: theme.spacing(2.5),
  },
  rightLast: {
    borderBottomRightRadius: theme.spacing(2.5),
  },
  chatDisplayName: {
    color: theme.palette.neutralShades[700],
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatTimestamp: {
    color: theme.palette.neutralShades[400],
    fontSize: 10,
  },
  chatLink: {
    display: 'inline-block',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  encryptedStateWarning: {
    color: theme.palette.warning.main,
  },
  encryptStateIcon: {
    color: theme.palette.neutralShades[500],
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    width: '10px',
    height: '10px',
  },
  imageAttachmentRight: {
    borderRadius: theme.spacing(2.5, 2.5, 0, 2.5),
    margin: theme.spacing(-1, -2, -2, -2),
    cursor: 'pointer',
    maxWidth: '250px',
  },
  imageAttachmentLeft: {
    borderRadius: theme.spacing(2.5, 2.5, 2.5, 0),
    margin: theme.spacing(-1, -2, -2, -2),
    cursor: 'pointer',
    maxWidth: '250px',
  },
  genericAttachment: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.neutralShades[600],
  },
  downloadIcon: {
    cursor: 'pointer',
    marginRight: theme.spacing(1),
    color: theme.palette.neutralShades[600],
    width: 25,
    height: 25,
  },
  loadingContainerLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: theme.palette.neutralShades[600],
    marginTop: theme.spacing(1),
  },
  loadingContainerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: theme.palette.neutralShades[200],
    marginTop: theme.spacing(1),
  },
  loadingIcon: {
    color: 'inherit',
  },
  metadata: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontStyle: 'italic',
    color: theme.palette.neutralShades[500],
    marginBottom: theme.spacing(1),
  },
  unsupportedMediaText: {
    fontStyle: 'italic',
  },
}));

export const useConversationComposeStyles = makeStyles<{
  textboxFocus: boolean;
  textboxDrag: boolean;
}>()((theme: Theme, {textboxFocus, textboxDrag}) => ({
  textboxContainer: {
    display: 'flex',
    margin: theme.spacing(0),
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  textboxBase: {
    border: `1px solid ${
      textboxDrag
        ? theme.palette.primary.main
        : textboxFocus
        ? theme.palette.neutralShades[500]
        : theme.palette.neutralShades[100]
    }`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: 12,
    backgroundColor: theme.palette.white,
  },
  textboxInput: {
    fontSize: 16,
    color: theme.palette.neutralShades[500],
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::placeholder': {color: theme.palette.neutralShades[500], opacity: 1},
    '&::-webkit-input-placeholder': {
      color: theme.palette.neutralShades[400],
      opacity: 1,
    },
  },
  icon: {
    margin: theme.spacing(1, 1, 1, 0),
    cursor: 'pointer',
    width: 24,
    height: 24,
  },
  sendIcon: {
    color: theme.palette.primary.main,
  },
  sendIconError: {
    color: 'red',
  },
  attachIcon: {
    color: theme.palette.neutralShades[500],
  },
  sendingProgress: {
    color: theme.palette.neutralShades[500],
    margin: theme.spacing(1),
  },
}));

export const useConversationStyles = makeStyles<{
  isChatRequest?: boolean;
}>()((theme: Theme, {isChatRequest}) => ({
  cardContainer: {
    backgroundColor: 'transparent',
    padding: theme.spacing(1),
    border: 'none',
    height: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.neutralShades[400],
  },
  loadingText: {
    marginTop: theme.spacing(1),
    color: 'inherit',
  },
  loadingSpinner: {
    color: 'inherit',
  },
  conversationContainer: {
    display: 'flex',
    flexDirection: 'column-reverse',
    borderBottom: isChatRequest ? undefined : '1px dashed #eeeeee',
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    height: '430px',
    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 170px)',
    },
  },
  composeContainer: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    height: 35,
    width: 35,
  },
  headerActionContainer: {
    display: 'flex',
    color: theme.palette.neutralShades[600],
    alignItems: 'center',
  },
  headerTitleContainer: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100px',
  },
  headerBackIcon: {
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  headerCloseIcon: {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  chatTimestamp: {
    minWidth: '65px',
    textAlign: 'right',
    color: theme.palette.neutralShades[600],
  },
  infiniteScroll: {
    margin: 0,
    padding: 0,
  },
  infiniteScrollLoading: {
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.neutralShades[400],
    marginBottom: theme.spacing(1),
  },
  acceptContainer: {
    borderTop: '1px dashed #eeeeee',
    color: theme.palette.neutralShades[600],
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    textAlign: 'center',
  },
  acceptButton: {
    marginTop: theme.spacing(1),
  },
  acceptText: {
    marginBottom: theme.spacing(2),
  },
}));
