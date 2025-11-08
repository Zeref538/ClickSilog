import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getScreenDimensions } from '../utils/responsive';

/**
 * Hook to get responsive screen dimensions
 * Updates when screen size changes (e.g., device rotation)
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(getScreenDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getScreenDimensions());
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export default useResponsive;

