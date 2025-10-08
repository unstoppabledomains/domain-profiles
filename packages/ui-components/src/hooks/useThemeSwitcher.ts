import {useContext} from 'react';

import {ThemeSwitcherContext} from '../providers';

const useThemeSwitcher = () => {
  const {mode, setMode} = useContext(ThemeSwitcherContext);
  return {
    mode,
    setMode,
  };
};

export default useThemeSwitcher;
