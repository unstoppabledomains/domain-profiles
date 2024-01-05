import React, {useState} from 'react';

type Props = {
  children: React.ReactNode;
};

type SetString = (s?: string) => void;
type SetIsChatReady = (isReady: boolean) => void;

export const UnstoppableMessagingContext = React.createContext<{
  setIsChatReady?: SetIsChatReady;
  isChatReady?: boolean;
  setOpenChat?: SetString;
  openChat?: string;
  setOpenCommunity?: SetString;
  openCommunity?: string;
  setChatAddress?: SetString;
  chatAddress?: string;
  setChatUser?: SetString;
  chatUser?: string;
}>({});

const UnstoppableMessagingProvider: React.FC<Props> = ({children}) => {
  const [isChatReady, setIsChatReady] = useState(false);
  const [chatAddress, setChatAddress] = useState<string>();
  const [chatUser, setChatUser] = useState<string>();
  const [activeChatId, setActiveChatId] = useState<string>();
  const [activeCommunityId, setActiveCommunityId] = useState<string>();

  const value = {
    setIsChatReady,
    isChatReady,
    setOpenChat: setActiveChatId,
    openChat: activeChatId,
    setOpenCommunity: setActiveCommunityId,
    openCommunity: activeCommunityId,
    chatAddress,
    setChatAddress,
    setChatUser,
    chatUser,
  };

  return (
    <UnstoppableMessagingContext.Provider value={value}>
      {children}
    </UnstoppableMessagingContext.Provider>
  );
};

export default UnstoppableMessagingProvider;
