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
    chatAddress,
    setChatAddress,
    chatUser,
    setChatUser,
  } = useContext(UnstoppableMessagingContext);
  if (
    !setOpenChat ||
    !setOpenCommunity ||
    !setIsChatReady ||
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
    chatAddress,
    setChatAddress,
    chatUser,
    setChatUser,
  };
};

export default useUnstoppableMessaging;
