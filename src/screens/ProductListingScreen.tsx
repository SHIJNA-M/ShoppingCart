/**
 * ProductListingScreen — Figma "Category Products" screen
 * "Found X Results" heading, Filter button, 2-col product grid.
 */
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { BorderRadius, Colors, Spacing, Typography } from '../theme/tokens';
import type { FilterState, HomeStackParamList, Product, SortOption } from '../types';

type Props = StackScreenProps<HomeStackParamList, 'ProductListing'>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating_desc' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductListingScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const { state, setFilter, setSort } = useProducts();
  const { state: wishlistState, toggleWishlist } = useWishlist();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [priceMinDraft, setPriceMinDraft] = useState('');
  const [priceMaxDraft, setPriceMaxDraft] = useState('');
  const [selectedSizesDraft, setSelectedSizesDraft] = useState<string[]>([]);

  const displayedProducts = useMemo(() => {
    let result = state.products.filter((p) => p.categoryId === categoryId);
    if (state.filters.priceMin !== undefined) {
      result = result.filter((p) => p.price >= state.filters.priceMin!);
    }
    if (state.filters.priceMax !== undefined) {
      result = result.filter((p) => p.price <= state.filters.priceMax!);
    }
    if (state.filters.sizes && state.filters.sizes.length > 0) {
      result = result.filter((p) =>
        state.filters.sizes!.some((s) => p.sizeOptions.includes(s)),
      );
    }
    switch (state.filters.sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return result;
  }, [state.products, state.filters, categoryId]);

  const hasActiveFilters =
    state.filters.priceMin !== undefined ||
    state.filters.priceMax !== undefined ||
    (state.filters.sizes && state.filters.sizes.length > 0);

  function openFilterModal() {
    setPriceMinDraft(
      state.filters.priceMin !== undefined ? String(state.filters.priceMin / 100) : '',
    );
    setPriceMaxDraft(
      state.filters.priceMax !== undefined ? String(state.filters.priceMax / 100) : '',
    );
    setSelectedSizesDraft(state.filters.sizes ?? []);
    setFilterModalVisible(true);
  }

  function applyFilters() {
    const update: Partial<FilterState> = {
      priceMin: priceMinDraft !== '' ? Math.round(parseFloat(priceMinDraft) * 100) : undefined,
      priceMax: priceMaxDraft !== '' ? Math.round(parseFloat(priceMaxDraft) * 100) : undefined,
      sizes: selectedSizesDraft.length > 0 ? selectedSizesDraft : undefined,
    };
    setFilter(update);
    setFilterModalVisible(false);
  }

  function clearFilters() {
    setPriceMinDraft('');
    setPriceMaxDraft('');
    setSelectedSizesDraft([]);
    setFilter({ priceMin: undefined, priceMax: undefined, sizes: undefined });
    setFilterModalVisible(false);
  }

  function toggleSizeDraft(size: string) {
    setSelectedSizesDraft((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function applySort(value: SortOption) {
    setSort(value);
    setSortModalVisible(false);
  }

  function renderProduct({ item }: { item: Product }) {
    return (
      <View style={styles.cardWrapper}>
        <ProductCard
          product={item}
          wishlisted={wishlistState.productIds.has(item.id)}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          onWishlistToggle={() => toggleWishlist(item.id)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Figma header: "Found X Results" + Filter button */}
      <View style={styles.subHeader}>
        <View>
          <Text style={styles.foundLabel}>Found</Text>
          <Text style={styles.resultCount}>
            {displayedProducts.length} Results
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={openFilterModal}
          accessibilityRole="button"
          accessibilityLabel="Filter products"
        >
          <Text style={styles.filterButtonText}>
            {hasActiveFilters ? '● Filter' : 'Filter'} ▾
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Filter</Text>
          <Text style={styles.filterLabel}>Price Range ($)</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
              value={priceMinDraft}
              onChangeText={setPriceMinDraft}
              accessibilityLabel="Minimum price"
            />
            <Text style={styles.priceSeparator}>–</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
              value={priceMaxDraft}
              onChangeText={setPriceMaxDraft}
              accessibilityLabel="Maximum price"
            />
          </View>
          <Text style={styles.filterLabel}>Sizes</Text>
          <View style={styles.sizeRow}>
            {SIZE_OPTIONS.map((size) => {
              const selected = selectedSizesDraft.includes(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeChip, selected && styles.sizeChipSelected]}
                  onPress={() => toggleSizeDraft(size)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`Size ${size}`}
                >
                  <Text style={[styles.sizeChipText, selected && styles.sizeChipTextSelected]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)} />
          <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <ScrollView>
            {SORT_OPTIONS.map((option) => {
              const isSelected = state.filters.sortBy === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.sortOption}
                  onPress={() => applySort(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option.label}
                >
                  <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  foundLabel: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 28,
  },
  resultCount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 28,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.full,
  },
  filterButtonActive: {
    borderColor: Colors.black,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray800,
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: Typography.fontSize.base,
    color: Colors.black,
  },
  priceSeparator: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sizeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
  },
  sizeChipSelected: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
  },
  sizeChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray800,
  },
  sizeChipTextSelected: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  clearButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray800,
  },
  applyButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  sortOptionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray800,
  },
  sortOptionTextSelected: {
    color: Colors.black,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    fontWeight: '700',
  },
});
