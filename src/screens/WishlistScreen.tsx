/**
 * WishlistScreen — displays a grid of wishlisted products.
 * Requirements: 3.7
 */
import React, { useMemo } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Colors, Spacing, Typography } from '../theme/tokens';
import type { Product, HomeStackParamList, MainTabParamList } from '../types';

type WishlistNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList >,
  StackNavigationProp<HomeStackParamList>
>;

export default function WishlistScreen() {
  const { state: wishlistState, toggleWishlist } = useWishlist();
  const { state: productState } = useProducts();
  const navigation = useNavigation<WishlistNavProp>();

  // Filter products to only those in the wishlist
  const wishlistedProducts = useMemo(() => {
    return productState.products.filter((p) =>
      wishlistState.productIds.has(p.id),
    );
  }, [productState.products, wishlistState.productIds]);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      wishlisted={true}
      onPress={() =>
        navigation.navigate('Home', {
          screen: 'ProductDetail',
          params: { productId: item.id },
        })
      }
      onWishlistToggle={() => toggleWishlist(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
      </View>

      <FlatList
        data={wishlistedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any product to save it here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.black,
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
    color: Colors.gray400,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.5,
  },
});
