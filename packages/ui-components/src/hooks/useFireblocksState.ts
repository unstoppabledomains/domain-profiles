import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {FireblocksStateKey} from '../lib/types/fireBlocks';

const useFireblocksState = (
  initWithPersistence?: boolean,
): [
  Record<string, Record<string, string>>,
  (state: Record<string, Record<string, string>>) => void,
] => {
  // define the available stores
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});

  // if a session state is already established, return the existing state
  // values to maintain the session
  if (Object.keys(sessionKeyState).length > 0) {
    return [sessionKeyState, setSessionKeyState];
  }

  // if persistent state is already established, return the existing state
  // values to maintain the persistent state
  if (Object.keys(persistentKeyState).length > 0) {
    return [persistentKeyState, setPersistentKeyState];
  }

  // if no state is found, initialize a new store with the requested level
  // of persistence
  return initWithPersistence
    ? [persistentKeyState, setPersistentKeyState]
    : [sessionKeyState, setSessionKeyState];
};

export default useFireblocksState;
