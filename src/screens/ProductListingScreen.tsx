import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList, Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductService } from '../services/productService';
import { useProducts } from '../context/ProductContext';
import { Colors, Typography } from '../theme/tokens';
import { ms, scale } from '../utils/scale';

type Props = StackScreenProps<HomeStackParamList, 'ProductListing'>;

export default function ProductListingScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { state } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const GAP = ms(12);
  const H_PAD = ms(16);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await ProductService.getProducts(
          { categoryId },
          controller.signal,
        );
        setProducts(result);
      } catch (err) {
        if (err instanceof Error && err.message === 'cancelled') return;
        console.error('[ProductListing] API failed:', err instanceof Error ? err.message : err);
        // Fall back to context products (API data if loaded, else mock)
        const filtered = state.products.filter((p) => p.categoryId === categoryId);
        setProducts(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [categoryId]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ flex: 1 }}>
      <ProductCard
        product={item}
        wishlisted={wishlist.has(item.id)}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        onWishlistToggle={() => toggleWishlist(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: H_PAD }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <FontAwesome5 name="chevron-left" size={ms(16)} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>

      {/* Results + Filter row */}
      <View style={[styles.subHeader, { paddingHorizontal: H_PAD }]}>
        <Text style={styles.resultsText}>
          Found{'\n'}
          <Text style={styles.resultsCount}>{isLoading ? '...' : `${products.length} Results`}</Text>
        </Text>
        <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filter">
          <Text style={styles.filterText}>Filter</Text>
          <FontAwesome5 name="chevron-down" size={ms(11)} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PAD }}
        contentContainerStyle={{ paddingTop: ms(12), paddingBottom: ms(80), gap: GAP }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={Colors.black} style={{ marginTop: 60 }} />
          ) : error ? (
            <Text style={styles.empty}>{error}</Text>
          ) : (
            <Text style={styles.empty}>No products found in this category.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(12),
    gap: ms(12),
  },
  backBtn: {
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
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.black,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: ms(12),
  },
  resultsText: {
    fontFamily: 'Product Sans',
    fontSize: Typography.fontSize.lg,
     fontWeight: '700',
    color: Colors.black,
    lineHeight: ms(30),
  },
  resultsCount: {
    fontFamily: 'Product Sans',
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.black,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    marginTop: ms(60),
    color: Colors.gray600,
    fontSize: Typography.fontSize.base,
  },
});
