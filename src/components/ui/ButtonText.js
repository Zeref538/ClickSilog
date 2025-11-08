import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fp } from '../../utils/responsive';

/**
 * ButtonText component that prevents wrapping and scales responsively
 * Ensures button text stays on a single line and scales down if needed
 */
const ButtonText = ({ 
  children, 
  style, 
  allowFontScaling = true,
  maxFontSize,
  minFontSize = 10,
  ...props 
}) => {
  // Get base font size from style or default
  const baseFontSize = style?.fontSize || 16;
  const responsiveFontSize = maxFontSize 
    ? Math.min(fp(baseFontSize), maxFontSize)
    : fp(baseFontSize);

  return (
    <Text
      style={[
        styles.buttonText,
        style,
        { fontSize: Math.max(responsiveFontSize, minFontSize) },
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit={true}
      allowFontScaling={allowFontScaling}
      minimumFontScale={0.7}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default ButtonText;


