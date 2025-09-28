import { useEffect, useState } from 'react';
import type { ObservableValue } from '../../state/observable';

export function useObservableValue<T>(observable: ObservableValue<T>): T {
  const [value, setValue] = useState(observable.value);

  useEffect(() => {
    setValue(observable.value);
    const unsubscribe = observable.subscribe(() => {
      setValue(observable.value);
    });
    return () => {
      unsubscribe();
    };
  }, [observable]);

  return value;
}
