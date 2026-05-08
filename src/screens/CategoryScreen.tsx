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
  'cat-clothing':    '#A3A798',
  'cat-accessories': '#898280',
  'cat-shoes':       '#44565C',
  'cat-bags':        '#B9AEB2',
};

const IMG_RESIZE: Record<string, 'cover' | 'contain'> = {
  'cat-clothing':    'cover',
  'cat-accessories': 'cover',
  'cat-shoes':       'contain',
  'cat-bags':        'cover',
};

export default function CategoryScreen({ navigation }: Props) {
  const { state } = useProducts();
  const [q, setQ] = useState('');
  const { width: W } = useWindowDimensions();

  const CARD_H   = W * 0.38;        // card height
  const RADIUS   = W * 0.05;        // border radius
  const IMG_W    = W * 0.46;        // image occupies right 46%
  const OVERFLOW = W * 0.06;        // small overflow above card
  const IMG_H    = CARD_H + OVERFLOW;
  const CIRCLE   = W * 0.28;        // outer circle
  const CIRCLE2  = CIRCLE * 0.60;   // inner circle

  const categories = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return state.categories;
    return state.categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [state.categories, q]);

  const renderItem = ({ item }: { item: Category }) => {
    const bg = CARD_COLORS[item.id] ?? '#888';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductListing', {
          categoryId: item.id,
          categoryName: item.name,
        })}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        // Wrapper is taller than card to give room for image overflow above
        style={{ height: CARD_H + OVERFLOW, marginBottom: W * 0.02 }}
      >
        {/* ── Card ── sits at the BOTTOM of wrapper, clips everything inside ── */}
        <View style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: CARD_H,
          borderRadius: RADIUS,
          backgroundColor: bg,
          overflow: 'hidden',   // clips image bottom + circles
        }}>
          {/* Outer circle — centered behind image area */}
          <View style={{
            position: 'absolute',
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE / 2,
            backgroundColor: 'rgba(255,255,255,0.18)',
            right: (IMG_W - CIRCLE) / 2,   // horizontally centered in image area
            top: (CARD_H - CIRCLE) / 2,    // vertically centered in card
          }} />

          {/* Inner circle — centered inside outer */}
          <View style={{
            position: 'absolute',
            width: CIRCLE2,
            height: CIRCLE2,
            borderRadius: CIRCLE2 / 2,
            backgroundColor: 'rgba(255,255,255,0.13)',
            right: (IMG_W - CIRCLE2) / 2,  // horizontally centered in image area
            top: (CARD_H - CIRCLE2) / 2,   // vertically centered in card
          }} />

          {/* Label — vertically centered, left side */}
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

          {/* ── Image ── right-aligned, taller than card so top overflows ── */}
          {/* negative top = -OVERFLOW pulls image up above card boundary    */}
          {/* overflow:hidden on card clips the bottom of the image cleanly  */}
          <Image
            source={
              typeof item.imageUrl === 'number'
                ? item.imageUrl
                : { uri: item.imageUrl as string }
            }
            style={{
              position: 'absolute',
              right: 0,
              top: -OVERFLOW,
              width: IMG_W,
              height: IMG_H,
            }}
            resizeMode={IMG_RESIZE[item.id] ?? 'cover'}
            accessibilityLabel={item.name}
          />
        </View>
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
        <TouchableOpacity style={styles.iconBtn}>
          <FontAwesome5 name="bars" size={ms(18)} color={Colors.black} />
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
          paddingTop: OVERFLOW,
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
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn:   { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E53935',
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
});
