/**
 * ProductDetailScreen — matches Figma design
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList, Product } from '../types';
import ImageCarousel from '@components/ImageCarousel';
import ColorSwatch from '@components/ColorSwatch';
import ProductCard from '@components/ProductCard';
import { useProducts } from '@context/ProductContext';
import { useCart } from '@context/CartContext';
import { useWishlist } from '@context/WishlistContext';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { Colors } from '@theme/tokens';
import { scale, vs, ms } from '../utils/scale';

type Props = StackScreenProps<HomeStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window'); // fallback for StyleSheet

function formatPrice(price: number): string {
  return `$ ${price.toFixed(2)}`;
}

function StarRating({ rating, count, size = 16 }: { rating: number; count: number; size?: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={[styles.star, { fontSize: ms(size) }, star <= Math.round(rating) ? styles.starFilled : styles.starEmpty]}>
          ★ 
        </Text>
      ))}
      <Text style={styles.reviewCount}>({count})</Text>
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { state: productState } = useProducts();
  const { addItem } = useCart();
  const { state: wishlistState, toggleWishlist } = useWishlist();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Fetch the product from the API.
  // AbortController signal is passed to the service so the request is
  // cancelled automatically when the screen unmounts — no memory leaks.
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await ProductService.getProductById(productId, controller.signal);
        setProduct(data);
        // Fetch related products using the product's categoryId
        try {
          const related = await ProductService.getRelatedProducts(
            data.categoryId,
            data.id,
            controller.signal,
          );
          setSimilarProducts(related);
        } catch {
          // Related products are non-critical — fall back to context
          const fallback = productState.products
            .filter((p) => p.categoryId === data.categoryId && p.id !== data.id)
            .slice(0, 6);
          setSimilarProducts(fallback);
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'cancelled') return;
        const cached = productState.products.find((p) => p.id === productId);
        if (cached) {
          setProduct(cached);
          const fallback = productState.products
            .filter((p) => p.categoryId === cached.categoryId && p.id !== cached.id)
            .slice(0, 6);
          setSimilarProducts(fallback);
        } else {
          setFetchError(err instanceof Error ? err.message : 'Failed to load product');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [productId]);

  const [activeIndex, setActiveIndex]       = useState(0);
  const [selectedSize, setSelectedSize]     = useState<string | null>(null);
  const [selectedColor, setSelectedColor]   = useState<string | null>(
    product?.colorOptions?.[0]?.hex ?? null,
  );
  const [showSizePrompt, setShowSizePrompt] = useState(false);
  const [descExpanded, setDescExpanded]     = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(true);
  const [similarExpanded, setSimilarExpanded] = useState(true);

  if (isLoading) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  }

  if (fetchError || !product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{fetchError ?? 'Product not found.'}</Text>
      </View>
    );
  }

  const isWishlisted = wishlistState.productIds.has(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) { setShowSizePrompt(true); return; }
    addItem({
      productId: product.id,
      selectedSize,
      selectedColor: selectedColor ?? '',
      quantity: 1,
    });
    // Sync with API in background
    CartService.addToCart(product.id, 1).catch((err) =>
      console.warn('[Cart] add sync failed:', err.message),
    );
    setShowSizePrompt(false);
  };

  const isLongDesc = product.description.length > 120;
  const displayedDesc = !isLongDesc || descExpanded
    ? product.description
    : product.description.slice(0, 120) + '...';

  const FOOTER_H = vs(64) + vs(72) + (insets.bottom > 0 ? insets.bottom : vs(12));

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: FOOTER_H + vs(8) }}
      >
        {/* ── Image carousel ── */}
        <View style={styles.carouselWrapper}>
          <ImageCarousel
            images={product.images}
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
          />
          {/* Back */}
          <TouchableOpacity
            style={[styles.overlayBtn, { top: insets.top + scale(10), left: scale(16) }]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          {/* Wishlist */}
          <TouchableOpacity
            style={[
              styles.overlayBtn,
              styles.wishlistBtn,
              { top: insets.top + scale(10), right: scale(16) },
            ]}
            onPress={() => toggleWishlist(product.id)}
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Text style={[styles.heartIcon, isWishlisted && styles.heartActive]}>
              {isWishlisted ? '♥' : '♥'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Details ── */}
        <View style={styles.details}>

          {/* Name + Price */}
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Stars */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Color + Size row */}
          <View style={styles.colorSizeRow}>
            {/* Colors */}
            {product.colorOptions?.length > 0 && (
              <View style={styles.colorGroup}>
                <Text style={styles.groupLabel}>Color</Text>
                <View style={styles.swatchRow}>
                  {product.colorOptions.map((c) => (
                    <ColorSwatch
                      key={c.hex}
                      color={c.hex}
                      selected={selectedColor === c.hex}
                      onPress={() => setSelectedColor(c.hex)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Sizes */}
            {product.sizeOptions?.length > 0 && (
              <View style={styles.sizeGroup}>
                <Text style={styles.groupLabel}>Size</Text>
                <View style={styles.sizeRow}>
                  {product.sizeOptions.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizePill, selectedSize === size && styles.sizePillActive]}
                      onPress={() => { setSelectedSize(size); setShowSizePrompt(false); }}
                      accessibilityLabel={`Size ${size}`}
                    >
                      <Text style={[styles.sizePillText, selectedSize === size && styles.sizePillTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {showSizePrompt && (
                  <Text style={styles.sizePrompt}>Please select a size</Text>
                )}
              </View>
            )}
          </View>

          {/* ── Description ── */}
          <View style={styles.sectionBox}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setDescExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.chevron}>{descExpanded ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            {descExpanded && (
              <View style={styles.sectionBody}>
                <Text style={styles.descText}>{displayedDesc}</Text>
                {isLongDesc && (
                  <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                    <Text style={styles.readMore}>Read more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* ── Reviews ── */}
          <View style={styles.sectionBox}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setReviewsExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLabel}>Reviews</Text>
              <Text style={styles.chevron}>{reviewsExpanded ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            {reviewsExpanded && (
              <View style={[styles.sectionBody, styles.reviewsBody]}>
                <View style={styles.ratingBlock}>
                  <Text style={styles.ratingBig}>{product.rating.toFixed(1)}</Text>
                  <Text style={styles.outOf}>OUT OF 5</Text>
                </View>
                <View style={styles.ratingRight}>
                  <StarRating rating={product.rating} count={product.reviewCount} size={18} />
                  <Text style={styles.ratingsCount}>{product.reviewCount} ratings</Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Similar Products ── */}
          {similarProducts.length > 0 && (
            <View style={styles.sectionBox}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setSimilarExpanded((v) => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionLabel}>Similar Product</Text>
                <Text style={styles.chevron}>{similarExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              {similarExpanded && (
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
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── ADD TO CART footer ── */}
      <View style={[styles.footer, {
        paddingBottom: (insets.bottom > 0 ? insets.bottom : vs(12)) + vs(72),
      }]}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.white },
  notFound:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText:{ fontSize: ms(15), color: Colors.gray600 },

  /* Carousel */
  carouselWrapper: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  overlayBtn: {
    position: 'absolute',
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  wishlistBtn: { backgroundColor: '#FFFFFF' },
  backIcon:    { fontSize: ms(26), color: Colors.black, lineHeight: ms(30), marginTop: -2 },
  heartIcon:   { fontSize: ms(18), color:'#D8D8D8'},
  heartActive: { color: '#FF6E6E' },

  /* Details */
  details: {
    paddingHorizontal: scale(16),
    paddingTop: vs(14),
    backgroundColor: Colors.white,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    marginTop: -scale(24),   // overlap up over the image bottom
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(6),
  },
  productName: {
    flex: 1,
    fontSize: ms(20),
    fontWeight: '700',
    color: Colors.black,
    marginRight: scale(8),
  },
  productPrice: { fontSize: ms(20), fontWeight: '700', color: Colors.black },

  /* Stars */
  ratingRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: vs(14) },
  star:        {},
  starFilled:  { color: '#508A7B' },
  starEmpty:   { color: Colors.gray200 },
  reviewCount: { fontSize: ms(13), color: Colors.gray600, marginLeft: scale(4) },

  /* Color + Size */
  colorSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(16),
  },
  colorGroup:  { flex: 1 },
  sizeGroup:   { flex: 1, alignItems: 'flex-end' },
  groupLabel:  { fontSize: ms(14), fontWeight: '600', color: Colors.black, marginBottom: vs(8) },
  swatchRow:   { flexDirection: 'row', alignItems: 'center' },
  sizeRow:     { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  sizePill: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  sizePillActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  sizePillText:   { fontSize: ms(13), fontWeight: '600', color: Colors.gray600 },
  sizePillTextActive: { color: Colors.white },
  sizePrompt:  { fontSize: ms(12), color: Colors.error, marginTop: vs(4) },

  /* Sections */
  sectionBox: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: vs(14),
    marginBottom: vs(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: vs(10),
  },
  sectionLabel: { fontSize: ms(16), fontWeight: '700', color: Colors.black },
  chevron:      { fontSize: ms(16), fontWeight: '700', color: Colors.black },
  sectionBody:  { paddingBottom: vs(14) },

  /* Description */
  descText: { fontSize: ms(13), color: Colors.gray600, lineHeight: ms(22) },
  readMore: { fontSize: ms(13), color: '#2E7D32', fontWeight: '600', marginTop: vs(4) },

  /* Reviews */
  reviewsBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(24),
  },
  ratingBlock: { alignItems: 'flex-start' },
  ratingBig:   { fontSize: ms(48), fontWeight: '700', color: Colors.black, lineHeight: ms(52) },
  outOf:       { fontSize: ms(11), color: Colors.gray400, marginTop: vs(2) },
  ratingRight: { flex: 1 },
  ratingsCount:{ fontSize: ms(12), color: Colors.gray400, marginTop: vs(2) },

  /* Similar */
  similarScroll: { paddingVertical: vs(8), paddingRight: scale(16) },
  similarCard:   { width: scale(160), marginRight: scale(12) },

  /* Footer */
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: scale(16),
    paddingTop: vs(10),
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  addToCartBtn: {
    backgroundColor: '#1C1C1C',
    borderRadius: scale(50),
    paddingVertical: vs(16),
    alignItems: 'center',
    width: '100%',
  },
  addToCartText: {
    color: Colors.white,
    fontSize: ms(14),
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
