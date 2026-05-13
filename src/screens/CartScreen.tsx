/**
 * CartScreen — shows all items in the cart with quantity controls and total.
 */
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { CartService } from '../services/cartService';
import PrimaryButton from '../components/PrimaryButton';
import { BorderRadius, Colors, Spacing, Typography } from '../theme/tokens';
import { vs } from '../utils/scale';
import type { CartItem, CartStackParamList } from '../types';

type CartNavProp = NativeStackNavigationProp<CartStackParamList, 'CartMain'>;

// API returns whole dollar amounts e.g. 885 → "$ 885.00"
const formatPrice = (price: number) => `$ ${price.toFixed(2)}`;

export default function CartScreen() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { state: productState } = useProducts();
  const navigation = useNavigation<CartNavProp>();
  const insets = useSafeAreaInsets();

  const cartItems = state.items.map((item) => ({
    ...item,
    product: productState.products.find((p) => p.id === item.productId),
  }));

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price ?? 0) * item.quantity;
  }, 0);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleRemove = (item: typeof cartItems[0]) => {
    // Update local state immediately
    removeItem(item.productId, item.selectedSize, item.selectedColor);
    // Sync with API in background (fire and forget)
    CartService.removeFromCart(item.productId).catch((err) =>
      console.warn('[Cart] remove sync failed:', err.message),
    );
  };

  const handleUpdateQty = (
    item: typeof cartItems[0],
    newQty: number,
  ) => {
    updateQuantity(item.productId, item.selectedSize, item.selectedColor, newQty);
    // No direct quantity update API — remove + re-add handled locally
  };

  const renderItem = ({ item }: { item: typeof cartItems[0] }) => {
    if (!item.product) return null;
    const imageSource = item.product.images[0];

    return (
      <View style={styles.row}>
        <Image
          source={typeof imageSource === 'number' ? imageSource : { uri: imageSource as string }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.meta}>Size: {item.selectedSize}</Text>
          <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
          {/* Quantity controls */}
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item, item.quantity - 1)}
              accessibilityLabel="Decrease quantity"
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item, item.quantity + 1)}
              accessibilityLabel="Increase quantity"
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item)}
          accessibilityLabel="Remove item"
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        {totalItems > 0 && (
          <Text style={styles.itemCount}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
        )}
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => `${item.productId}-${item.selectedSize}-${item.selectedColor}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add items from the product page.</Text>
          </View>
        }
      />

      {state.items.length > 0 && (
        <View style={[styles.footer, {
          paddingBottom: vs(64) + (insets.bottom > 0 ? insets.bottom : Spacing.md),
        }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
          <PrimaryButton label="CHECKOUT" onPress={() => navigation.navigate('Checkout', { total })} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.black,
  },
  itemCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  image: {
    width: 90,
    height: 110,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  meta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray600,
    marginBottom: 4,
  },
  price: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 20,
  },
  qtyValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.black,
    marginHorizontal: Spacing.sm,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: Spacing.xs,
    alignSelf: 'flex-start',
  },
  removeBtnText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray400,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.black,
  },
  totalValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.black,
  },
});
