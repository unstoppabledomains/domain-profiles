import {useContext} from 'react';

import {UnstoppableMessagingContext} from '../providers/UnstoppableMessagingProvider';

const useUnstoppableMessaging = () => {
  const {
    openChat,
    setOpenChat,
    openCommunity,
    setOpenCommunity,
    isChatReady,
    setIsChatReady,
    isChatOpen,
    setIsChatOpen,
    chatAddress,
    setChatAddress,
    chatUser,
    setChatUser,
  } = useContext(UnstoppableMessagingContext);
  if (
    !setOpenChat ||
    !setOpenCommunity ||
    !setIsChatReady ||
    !setIsChatOpen ||
    !setChatUser ||
    !setChatAddress
  ) {
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
    isChatOpen,
    setIsChatOpen,
    chatAddress,
    setChatAddress,
    chatUser,
    setChatUser,
  };
};

export default useUnstoppableMessaging;
