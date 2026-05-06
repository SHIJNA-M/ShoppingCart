/**
 * ProductDetailScreen — Figma "Single Product" screen
 */
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types';
import ImageCarousel from '@components/ImageCarousel';
import SizeOption from '@components/SizeOption';
import ProductCard from '@components/ProductCard';
import PrimaryButton from '@components/PrimaryButton';
import { useProducts } from '@context/ProductContext';
import { useCart } from '@context/CartContext';
import { useWishlist } from '@context/WishlistContext';
import { Colors, Spacing, Typography } from '@theme/tokens';

type Props = StackScreenProps<HomeStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatPrice(cents: number): string {
  return `$ ${(cents / 100).toFixed(2)}`;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={[styles.star, star <= Math.round(rating) ? styles.starFilled : styles.starEmpty]}
        >
          ★
        </Text>
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
      <Text style={styles.reviewCount}>({count})</Text>
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { state: productState } = useProducts();
  const { addItem } = useCart();
  const { state: wishlistState, toggleWishlist } = useWishlist();

  const product = productState.products.find((p) => p.id === productId);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizePrompt, setShowSizePrompt] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found.</Text>
      </View>
    );
  }

  const isWishlisted = wishlistState.productIds.has(product.id);

  const similarProducts = product.similarProductIds
    .map((id) => productState.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizePrompt(true);
      return;
    }
    addItem({ productId: product.id, selectedSize, selectedColor: '', quantity: 1 });
    setShowSizePrompt(false);
  };

  const descriptionText = product.description;
  const isLongDesc = descriptionText.length > 100;
  const displayedDesc =
    !isLongDesc || descExpanded ? descriptionText : descriptionText.slice(0, 100) + '...';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image carousel — full width, taller aspect ratio */}
        <View style={styles.carouselWrapper}>
          <ImageCarousel
            images={product.images}
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
          />
          {/* Back button overlay */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          {/* Wishlist heart overlay */}
          <TouchableOpacity
            style={styles.wishlistOverlay}
            onPress={() => toggleWishlist(product.id)}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Text style={[styles.heartIcon, isWishlisted && styles.heartActive]}>
              {isWishlisted ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          {/* Name + Price */}
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Star rating */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Size */}
          {product.sizeOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Size</Text>
              <View style={styles.sizeRow}>
                {product.sizeOptions.map((size) => (
                  <SizeOption
                    key={size}
                    size={size}
                    selected={selectedSize === size}
                    onPress={() => {
                      setSelectedSize(size);
                      setShowSizePrompt(false);
                    }}
                  />
                ))}
              </View>
              {showSizePrompt && (
                <Text style={styles.sizePrompt}>Please select a size</Text>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{displayedDesc}</Text>
            {isLongDesc && (
              <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                <Text style={styles.readMore}>
                  {descExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reviews summary */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.reviewsSummary}>
            <Text style={styles.ratingBig}>{product.rating.toFixed(1)}</Text>
            <View>
              <Text style={styles.outOf}>OUT OF 5</Text>
              <StarRating rating={product.rating} count={product.reviewCount} />
              <Text style={styles.ratingsCount}>{product.reviewCount} ratings</Text>
            </View>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionLabel}>Similar Product</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScroll}
              >
                {similarProducts.map((similar) => (
                  <View key={similar.id} style={styles.similarCard}>
                    <ProductCard
                      product={similar}
                      wishlisted={wishlistState.productIds.has(similar.id)}
                      onPress={() => navigation.push('ProductDetail', { productId: similar.id })}
                      onWishlistToggle={() => toggleWishlist(similar.id)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart sticky footer */}
      <View style={styles.footer}>
        <PrimaryButton label="ADD TO CART" onPress={handleAddToCart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  notFoundText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  carouselWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 0.85,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.black,
    lineHeight: 28,
    marginTop: -2,
  },
  wishlistOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 18,
    color: Colors.gray600,
  },
  heartActive: {
    color: '#E53935',
  },
  details: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  productName: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.black,
    marginRight: Spacing.sm,
  },
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: '#F5A623',
  },
  starEmpty: {
    color: Colors.gray200,
  },
  ratingValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.gray800,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray400,
    marginLeft: 2,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizePrompt: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  descriptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    lineHeight: 20,
  },
  readMore: {
    fontSize: Typography.fontSize.sm,
    color: Colors.black,
    fontWeight: '600',
    marginTop: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  chevron: {
    fontSize: 20,
    color: Colors.gray400,
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  ratingBig: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.black,
  },
  outOf: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    marginBottom: 2,
  },
  ratingsCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  similarScroll: {
    paddingRight: Spacing.md,
  },
  similarCard: {
    width: 150,
    marginRight: Spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
});
