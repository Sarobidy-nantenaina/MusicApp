import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(
    getOrientation()
  );

  useEffect(() => {
    function updateOrientation() {
      setOrientation(getOrientation());
    }

    Dimensions.addEventListener('change', updateOrientation);

    return () => {
      // No need to remove listener in newer versions of React Native
      // as the cleanup is handled automatically
    };
  }, []);

  return orientation;
}

function getOrientation(): Orientation {
  const { width, height } = Dimensions.get('window');
  return width < height ? 'portrait' : 'landscape';
}