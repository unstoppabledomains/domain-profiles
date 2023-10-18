import {useEffect, useRef} from 'react';

/**
 * A hook to get the previous props or state.
 * Extracted from https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state.
 * The only difference is the `isUndefinedFirst` option.
 *
 * isUndefinedFirst:
 *    If true, the value of the initial render will be the same as the value
 *    provided to the hook. Else, the initial value will be undefined. Defaults to true.
 */
const usePrevious = <T>(value: T, isUndefinedFirst = true) => {
  const ref = useRef(isUndefinedFirst ? undefined : value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
};
export default usePrevious;
