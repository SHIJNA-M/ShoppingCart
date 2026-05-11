import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SearchIcon from '../assets/icons/Union.svg';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList, Category } from '../types';
import { useProducts } from '../context/ProductContext';
import { Colors } from '../theme/tokens';
import { ms } from '../utils/scale';

type Props = StackScreenProps<HomeStackParamList, 'Category'>;

const CARD_COLORS: Record<string, string> = {
  'cat-clothing': '#A3A798',
  'cat-accessories': '#898280',
  'cat-shoes': '#44565C',
  'cat-bags': '#B9AEB2',
};

const IMG_RESIZE: Record<string, 'cover' | 'contain'> = {
  'cat-clothing': 'contain',
  'cat-accessories': 'contain',
  'cat-shoes': 'contain',
  'cat-bags': 'contain',
};

/**
 * Figma base frame: 375px wide
 * Card: 313×126px → ratios: W*0.835 × W*0.336
 * Outer circle: 123×126, left:188 → right = (313-188-123)/313 of card = near right edge
 * Inner circle: 75×75, left:200, top:25
 * Image: right half of card, portrait, overflows top
 */
const IMG_CONFIG: Record<string, {
  widthRatio: number;
  heightRatio: number;
  overflowRatio: number;
  right: number;
  anchor: 'top' | 'bottom';
}> = {

  'cat-clothing': {
    widthRatio: 0.46,
    heightRatio: 0.82,
    overflowRatio: 0.10,
    anchor: 'top',
    right: -4,
  },

  'cat-accessories': {
    widthRatio: 0.52,
    heightRatio: 0.48,
    overflowRatio: 0.00,
    anchor: 'bottom',
    right: -10,
  },

  'cat-shoes': {
    widthRatio: 0.52,
    heightRatio: 0.72,
    overflowRatio: 0.10,
    anchor: 'top',
    right: 15,
  },

  'cat-bags': {
    widthRatio: 0.40,
    heightRatio: 0.76,
    overflowRatio: 0.10,
    anchor: 'top',
    right: -4,
  },
};

export default function CategoryScreen({ navigation }: Props) {
  const { state } = useProducts();
  const [q, setQ] = useState('');
  const { width: W } = useWindowDimensions();

  // Figma base: 375px. Card: 313×126. Circles from Figma specs.
  const CARD_H = W * 0.40;   // 126/375
  const RADIUS = W * 0.05;
  const CIRCLE = W * 0.328;   // outer: 123/375
  const CIRCLE2 = W * 0.200;   // inner: 75/375

  const categories = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return state.categories;
    return state.categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [state.categories, q]);

  const renderItem = ({ item }: { item: Category }) => {
    const bg = CARD_COLORS[item.id] ?? '#888';
    const cfg = IMG_CONFIG[item.id] ?? { widthRatio: 0.46, heightRatio: 0.50, overflowRatio: 0.06, anchor: 'top' as const };

    const IMG_W = W * cfg.widthRatio;
    const OVERFLOW = W * cfg.overflowRatio;
    const IMG_H = CARD_H;   // image height = card height exactly

    // anchor: 'top' → slight overflow above (top: -OVERFLOW)
    // anchor: 'bottom' → flush with card bottom
    const imgPosition = cfg.anchor === 'top'
      ? { bottom: 0, top: undefined }   // bottom-anchor so image fills card, top peeks out via wrapper
      : { bottom: 0, top: undefined };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductListing', {
          categoryId: item.id,
          categoryName: item.name,
        })}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        style={{ height: CARD_H + W * 0.08, marginBottom: W * 0.04 }}
      >
        {/* ── Card — circles + label only, overflow:hidden clips circles ── */}
        <View style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: CARD_H,
          borderRadius: RADIUS,
          backgroundColor: bg,
          overflow: 'hidden',
        }}>
          {/* Outer circle */}
          <View style={{
            position: 'absolute',
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE / 2,
            backgroundColor: 'rgba(255,255,255,0.18)',
            right: W * 0.10,
            top: (CARD_H - CIRCLE) / 2,
          }} />

          {/* Inner circle */}
          <View style={{
            position: 'absolute',
            width: CIRCLE2,
            height: CIRCLE2,
            borderRadius: CIRCLE2 / 2,
            backgroundColor: 'rgba(255,255,255,0.13)',
            right: W * 0.16,
            top: CARD_H * 0.198,
          }} />

          {/* Label */}
          <Text style={{
            position: 'absolute',
            left: W * 0.05,
            top: (CARD_H / 2) - ms(10),
            fontSize: ms(15),
            fontWeight: '700',
            color: Colors.white,
            letterSpacing: 2,
          }}>
            {item.name.toUpperCase()}
          </Text>
        </View>

        {/* ── Image OUTSIDE card — no clipping, free to overflow ── */}
        <Image
          source={
            typeof item.imageUrl === 'number'
              ? item.imageUrl
              : { uri: item.imageUrl as string }
          }
          style={{
            position: 'absolute',
            right: 0,
            ...imgPosition,
            width: IMG_W,
            height: IMG_H,
            zIndex: 10,
          }}
          resizeMode={IMG_RESIZE[item.id] ?? 'contain'}
          accessibilityLabel={item.name}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.row, {
        paddingHorizontal: W * 0.05,
        paddingTop: W * 0.02,
        paddingBottom: W * 0.02,
      }]}>
        {/* <TouchableOpacity style={styles.iconBtn}>
          <FontAwesome5 name="bars" size={ms(18)} color={Colors.black} />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <Text style={{ fontSize: ms(20), fontWeight: '700', color: Colors.black }}>
          Discover
        </Text>
        <TouchableOpacity style={styles.iconBtn}>
          <FontAwesome5 name="bell" size={ms(18)} color={Colors.black} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      {/* Search row */}
      <View style={[styles.row, {
        paddingHorizontal: W * 0.05,
        paddingBottom: W * 0.04,
        gap: W * 0.025,
      }]}>
        <View style={[styles.searchBox, {
          height: W * 0.12,
          borderRadius: W * 0.06,
          paddingHorizontal: W * 0.04,
          gap: W * 0.02,
        }]}>
          <SearchIcon width={ms(16)} height={ms(16)} fill="#9B9B9B" />
          <TextInput
            style={{ flex: 1, fontSize: ms(14), color: Colors.black, paddingVertical: 0 }}
            placeholder="Search"
            placeholderTextColor="#9B9B9B"
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={[styles.filterBtn, {
          width: W * 0.12,
          height: W * 0.12,
          borderRadius: W * 0.035,
        }]}>
          <FontAwesome5 name="sliders-h" size={ms(15)} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: W * 0.05,
          paddingTop: W * 0.04,   // max overflow across all categories
          paddingBottom: W * 0.22,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.gray600 }}>
            No categories found.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF466F',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  filterBtn: {
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 4,
},

menuLine: {
  width: 20,
  height: 2.2,
  backgroundColor: '#2B2B2B',
  borderRadius: 2,
},
});
