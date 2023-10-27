import {useContext} from 'react';

import {UnstoppableMessagingContext} from '../../../components/Chat/provider/UnstoppableMessagingProvider';

const useUnstoppableMessaging = () => {
  const {
    openChat,
    setOpenChat,
    openCommunity,
    setOpenCommunity,
    isChatReady,
    setIsChatReady,
    chatUser,
    setChatUser,
  } = useContext(UnstoppableMessagingContext);
  if (!setOpenChat || !setOpenCommunity || !setIsChatReady || !setChatUser) {
    throw new Error(
      'Expected useUnstoppableMessaging to be called within <ChatProvider />',
    );
  }
  return {
    openChat,
    setOpenChat,
    openCommunity,
    setOpenCommunity,
    isChatReady,
    setIsChatReady,
    chatUser,
    setChatUser,
  };
};

export default useUnstoppableMessaging;
