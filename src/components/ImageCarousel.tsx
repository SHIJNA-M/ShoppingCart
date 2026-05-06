import React, { useRef } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../theme/tokens';

interface ImageCarouselProps {
  images: (string | number)[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Clamps the next index within valid bounds.
 * Forward swipe:  min(i + 1, N - 1)
 * Backward swipe: max(i - 1, 0)
 */
export const clampIndex = (current: number, direction: 'forward' | 'backward', total: number): number => {
  if (direction === 'forward') {
    return Math.min(current + 1, total - 1);
  }
  return Math.max(current - 1, 0);
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  activeIndex,
  onIndexChange,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const pageWidth = SCREEN_WIDTH;

  /**
   * Fired when the user finishes scrolling. Determines the new page index
   * from the scroll offset and calls onIndexChange with the clamped value.
   */
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(offsetX / pageWidth);
    // Clamp to valid range
    const clamped = Math.max(0, Math.min(rawIndex, images.length - 1));
    if (clamped !== activeIndex) {
      onIndexChange(clamped);
    }
  };

  if (images.length === 0) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.container}>
      {/* Horizontally scrollable image strip */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentOffset={{ x: activeIndex * pageWidth, y: 0 }}
        accessibilityRole="adjustable"
        accessibilityLabel={`Image ${activeIndex + 1} of ${images.length}`}
        accessibilityHint="Swipe left or right to browse images"
      >
        {images.map((img, index) => (
          <View
            key={index}
            style={[styles.imageSlide, { width: pageWidth }]}
            accessibilityLabel={`Product image ${index + 1}`}
          >
            <Image
              source={typeof img === 'number' ? img : { uri: img }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`Product image ${index + 1}`}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      {images.length > 1 && (
        <View style={styles.dotsContainer} accessibilityElementsHidden>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.gray100,
  },
  emptyContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.gray100,
  },
  imageSlide: {
    aspectRatio: 1,
    backgroundColor: Colors.gray100,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: Colors.black,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: Colors.gray400,
  },
});

export default ImageCarousel;
