import {sleep} from './sleep';

export const pollUntilSuccess = async <T>({
  fn,
  attempts,
  interval,
}: {
  fn: () => Promise<{success: boolean; value?: T}>;
  attempts: number;
  interval: number;
}): Promise<{success: boolean; value?: T}> => {
  for (let i = 0; i < attempts; i++) {
    const {success, value} = await fn();
    if (success) {
      return {success, value};
    }
    await sleep(interval);
  }
  return {success: false};
};
