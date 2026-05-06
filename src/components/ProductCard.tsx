import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/tokens';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onPress: () => void;
  onWishlistToggle: () => void;
}

const formatPrice = (cents: number): string => `$ ${(cents / 100).toFixed(2)}`;

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  wishlisted,
  onPress,
  onWishlistToggle,
}) => {
  const imageUri = product.images[0] ?? '';
  // Derive a fake original price (~20% higher) for the strikethrough display
  const originalPrice = Math.round(product.price * 1.2);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={typeof imageUri === 'number' ? imageUri : { uri: imageUri as string }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Image of ${product.name}`}
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={onWishlistToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={
            wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          accessibilityState={{ selected: wishlisted }}
        >
          <Text style={[styles.heartIcon, wishlisted ? styles.heartActive : styles.heartInactive]}>
            {wishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>{formatPrice(product.price)}</Text>
          <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
        </View>
        {/* Star rating */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              style={[
                styles.star,
                star <= Math.round(product.rating) ? styles.starFilled : styles.starEmpty,
              ]}
            >
              ★
            </Text>
          ))}
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    margin: Spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 15,
    lineHeight: 18,
  },
  heartActive: {
    color: '#E53935',
  },
  heartInactive: {
    color: Colors.gray600,
  },
  info: {
    padding: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.gray800,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  salePrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.black,
  },
  originalPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 11,
  },
  starFilled: {
    color: '#F5A623',
  },
  starEmpty: {
    color: Colors.gray200,
  },
  reviewCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    marginLeft: 2,
  },
});

export default ProductCard;
