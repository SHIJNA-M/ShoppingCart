/**
 * CategoryScreen — Figma "Discover" screen
 * Full-width banner cards with category name overlaid on image.
 */
import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types';
import { useProducts } from '../context/ProductContext';
import SearchBar from '../components/SearchBar';
import { Colors, Spacing, Typography } from '../theme/tokens';
import type { Category } from '../types';

type Props = StackScreenProps<HomeStackParamList, 'Category'>;

export default function CategoryScreen({ navigation }: Props) {
  const { state } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return state.categories;
    return state.categories.filter((cat) =>
      cat.name.toLowerCase().includes(query),
    );
  }, [state.categories, searchQuery]);

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('ProductListing', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.bannerCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <Image
        source={typeof item.imageUrl === 'number' ? item.imageUrl : { uri: item.imageUrl }}
        style={styles.bannerImage}
        resizeMode="cover"
        accessibilityLabel={item.name}
      />
      {/* Dark overlay */}
      <View style={styles.overlay} />
      <Text style={styles.bannerLabel}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.menuIcon}>☰</Text>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.bellIcon}>🔔</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
        />
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  menuIcon: {
    fontSize: 22,
    color: Colors.black,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  bellIcon: {
    fontSize: 20,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  bannerCard: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  bannerLabel: {
    position: 'absolute',
    left: Spacing.md,
    bottom: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1.5,
  },
  emptyContainer: {
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
});
