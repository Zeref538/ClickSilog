import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  useWindowDimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { alertService } from '../../services/alertService';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

const ImageCropper = ({ visible, imageUri, onClose, onCrop }) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const CROP_SIZE = useMemo(() => Math.min(SCREEN_WIDTH - 40, 300), [SCREEN_WIDTH]);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const panResponder = useRef(null);
  const scaleRef = useRef(1);
  const translateXRef = useRef(0);
  const translateYRef = useRef(0);
  const lastScaleRef = useRef(1);
  const lastTranslateXRef = useRef(0);
  const lastTranslateYRef = useRef(0);

  useEffect(() => {
    if (imageUri && visible) {
      setImageLoaded(false);
      try {
        Image.getSize(
          imageUri,
          (width, height) => {
            if (!width || !height || width <= 0 || height <= 0) {
              console.error('Invalid image dimensions:', { width, height });
              alertService.error('Error', 'Invalid image. Please try selecting a different image.');
              setImageLoaded(false);
              setImageSize({ width: 0, height: 0 });
              return;
            }
            
            const aspectRatio = width / height;
            let displayWidth = CROP_SIZE;
            let displayHeight = CROP_SIZE / aspectRatio;
            
            if (displayHeight > CROP_SIZE) {
              displayHeight = CROP_SIZE;
              displayWidth = CROP_SIZE * aspectRatio;
            }
            
            setImageSize({ width: displayWidth, height: displayHeight });
            setImageLoaded(true);
            setScale(1);
            setTranslateX(0);
            setTranslateY(0);
            scaleRef.current = 1;
            translateXRef.current = 0;
            translateYRef.current = 0;
            lastScaleRef.current = 1;
            lastTranslateXRef.current = 0;
            lastTranslateYRef.current = 0;
          },
          (error) => {
            console.error('Error getting image size:', error);
            alertService.error('Error', 'Failed to load image. Please try again.');
            setImageLoaded(false);
            setImageSize({ width: 0, height: 0 });
            // Close the cropper on error
            if (onClose) {
              onClose();
            }
          }
        );
      } catch (error) {
        console.error('Error in Image.getSize:', error);
        alertService.error('Error', 'Failed to process image. Please try again.');
        setImageLoaded(false);
        setImageSize({ width: 0, height: 0 });
        // Close the cropper on error
        if (onClose) {
          onClose();
        }
      }
    } else {
      setImageLoaded(false);
      setImageSize({ width: 0, height: 0 });
    }
  }, [imageUri, visible, onClose]);

  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastTranslateXRef.current = translateXRef.current;
        lastTranslateYRef.current = translateYRef.current;
        lastScaleRef.current = scaleRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { numberActiveTouches } = evt.nativeEvent;
        
        if (numberActiveTouches === 2) {
          // Pinch to zoom
          const touches = evt.nativeEvent.touches;
          const touch1 = touches[0];
          const touch2 = touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );
          
          if (lastScaleRef.current === 1) {
            lastScaleRef.current = distance / 100;
          }
          
          const newScale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, (distance / 100) / lastScaleRef.current * scaleRef.current)
          );
          
          scaleRef.current = newScale;
          setScale(newScale);
        } else {
          // Pan
          const newTranslateX = lastTranslateXRef.current + gestureState.dx;
          const newTranslateY = lastTranslateYRef.current + gestureState.dy;
          
          const scaledWidth = imageSize.width * scaleRef.current;
          const scaledHeight = imageSize.height * scaleRef.current;
          
          const maxX = (scaledWidth - CROP_SIZE) / 2;
          const maxY = (scaledHeight - CROP_SIZE) / 2;
          
          translateXRef.current = Math.max(-maxX, Math.min(maxX, newTranslateX));
          translateYRef.current = Math.max(-maxY, Math.min(maxY, newTranslateY));
          
          setTranslateX(translateXRef.current);
          setTranslateY(translateYRef.current);
        }
      },
      onPanResponderRelease: () => {
        lastTranslateXRef.current = translateXRef.current;
        lastTranslateYRef.current = translateYRef.current;
        lastScaleRef.current = scaleRef.current;
      },
    });
  }, [imageSize]);

  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, scaleRef.current + 0.2);
    scaleRef.current = newScale;
    setScale(newScale);
    lastScaleRef.current = newScale;
  };

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scaleRef.current - 0.2);
    scaleRef.current = newScale;
    setScale(newScale);
    lastScaleRef.current = newScale;
    
    // Adjust translation to keep image within bounds
    const scaledWidth = imageSize.width * newScale;
    const scaledHeight = imageSize.height * newScale;
    const maxX = Math.max(0, (scaledWidth - CROP_SIZE) / 2);
    const maxY = Math.max(0, (scaledHeight - CROP_SIZE) / 2);
    
    translateXRef.current = Math.max(-maxX, Math.min(maxX, translateXRef.current));
    translateYRef.current = Math.max(-maxY, Math.min(maxY, translateYRef.current));
    setTranslateX(translateXRef.current);
    setTranslateY(translateYRef.current);
  };

  const handleCrop = async () => {
    if (!imageUri || !imageLoaded) return;
    
    try {
      // For now, we'll use the image as-is since expo-image-manipulator requires native build
      // The visual cropping is shown to the user, but actual cropping requires:
      // 1. Rebuilding the app with: npx expo prebuild (for bare workflow)
      // 2. Or using EAS Build to create a development build
      // 3. Or using expo-image-picker's built-in cropping (allowsEditing: true)
      
      // The image is already visually cropped in the preview
      // In production, you would implement actual cropping here using expo-image-manipulator
      // after rebuilding the app
      
      onCrop(imageUri);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      alertService.error('Error', 'Failed to process image. Please try again.');
    }
  };

  // Early return if not visible or no image URI
  if (!visible) {
    return null;
  }
  
  if (!imageUri) {
    return null;
  }

  // Guard against invalid image size - show loading state instead of null
  if (!imageSize || imageSize.width === 0 || imageSize.height === 0 || !imageLoaded) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.backdrop }]}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              borderRadius: borderRadius.xl,
              paddingTop: spacing.xl + spacing.sm,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.md,
            }
          ]}>
            <View style={[
              styles.modalHeader,
              {
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
                paddingBottom: spacing.md,
                marginBottom: spacing.md,
              }
            ]}>
              <Text style={[
                styles.title,
                {
                  color: theme.colors.text,
                  ...typography.h2,
                }
              ]}>
                Loading Image...
              </Text>
              <AnimatedButton
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: theme.colors.error,
                    borderRadius: borderRadius.round,
                    width: 40,
                    height: 40,
                  }
                ]}
              >
                <Icon
                  name="close"
                  library="ionicons"
                  size={22}
                  color={theme.colors.onPrimary}
                />
              </AnimatedButton>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingTop: spacing.xl + spacing.sm,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
          }
        ]}>
          <Text style={[
            styles.title,
            {
              color: theme.colors.text,
              ...typography.h2,
            }
          ]}>
            Crop Image
          </Text>
          <AnimatedButton
            onPress={onClose}
            style={[
              styles.closeBtn,
              {
                backgroundColor: theme.colors.error,
                borderRadius: borderRadius.round,
                width: 40,
                height: 40,
              }
            ]}
          >
            <Icon
              name="close"
              library="ionicons"
              size={22}
              color={theme.colors.onPrimary}
            />
          </AnimatedButton>
        </View>

        <View style={styles.cropContainer}>
          <View style={[
            styles.cropArea,
            {
              width: CROP_SIZE,
              height: CROP_SIZE,
              borderColor: theme.colors.primary,
              borderWidth: 2,
              borderRadius: borderRadius.md,
            }
          ]}>
            {imageLoaded && (
              <View
                style={[
                  styles.imageContainer,
                  {
                    width: scaledWidth,
                    height: scaledHeight,
                    marginLeft: -CROP_SIZE / 2,
                    marginTop: -CROP_SIZE / 2,
                    transform: [
                      { translateX },
                      { translateY },
                    ],
                  }
                ]}
                {...panResponder.current?.panHandlers}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: scaledWidth,
                    height: scaledHeight,
                  }}
                  resizeMode="contain"
                  onError={(error) => {
                    console.error('Image load error:', error);
                    alertService.error('Error', 'Failed to load image. Please try selecting a different image.');
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                />
              </View>
            )}
          </View>
          
          <View style={[
            styles.overlay,
            {
              width: CROP_SIZE,
              height: CROP_SIZE,
            }
          ]} pointerEvents="none">
            <View style={styles.grid}>
              <View style={[styles.gridLineVertical, { backgroundColor: theme.colors.primary + '40', left: CROP_SIZE / 3 }]} />
              <View style={[styles.gridLineVertical, { backgroundColor: theme.colors.primary + '40', left: (CROP_SIZE * 2) / 3 }]} />
              <View style={[styles.gridLineHorizontal, { backgroundColor: theme.colors.primary + '40', top: CROP_SIZE / 3 }]} />
              <View style={[styles.gridLineHorizontal, { backgroundColor: theme.colors.primary + '40', top: (CROP_SIZE * 2) / 3 }]} />
            </View>
          </View>
        </View>

        <View style={[
          styles.controls,
          {
            backgroundColor: theme.colors.surface,
            padding: spacing.lg,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            gap: spacing.md,
          }
        ]}>
          <View style={styles.zoomControls}>
            <AnimatedButton
              onPress={handleZoomOut}
              style={[
                styles.zoomBtn,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: borderRadius.round,
                  width: 48,
                  height: 48,
                }
              ]}
            >
              <Icon
                name="remove"
                library="ionicons"
                size={24}
                color={theme.colors.text}
              />
            </AnimatedButton>
            <Text style={[
              styles.zoomText,
              {
                color: theme.colors.text,
                ...typography.body,
                marginHorizontal: spacing.md,
              }
            ]}>
              {Math.round(scale * 100)}%
            </Text>
            <AnimatedButton
              onPress={handleZoomIn}
              style={[
                styles.zoomBtn,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: borderRadius.round,
                  width: 48,
                  height: 48,
                }
              ]}
            >
              <Icon
                name="add"
                library="ionicons"
                size={24}
                color={theme.colors.text}
              />
            </AnimatedButton>
          </View>

          <View style={[styles.actionButtons, { gap: spacing.sm }]}>
            <AnimatedButton
              onPress={onClose}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  marginRight: spacing.sm,
                  flex: 1,
                }
              ]}
            >
              <Text style={[
                styles.cancelBtnText,
                {
                  color: theme.colors.text,
                  ...typography.bodyBold,
                }
              ]}>
                Cancel
              </Text>
            </AnimatedButton>
            <AnimatedButton
              onPress={handleCrop}
              style={[
                styles.cropBtn,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  flex: 1,
                }
              ]}
            >
              <Text style={[
                styles.cropBtnText,
                {
                  color: theme.colors.onPrimary,
                  ...typography.bodyBold,
                }
              ]}>
                Crop & Save
              </Text>
            </AnimatedButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cropArea: {
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    // marginLeft and marginTop moved to inline styles since they depend on CROP_SIZE
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  grid: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    top: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    left: 0,
  },
  controls: {
    // gap handled inline
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    minWidth: 60,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    // gap handled inline
  },
  cancelBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {},
  cropBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropBtnText: {},
});

export default ImageCropper;

