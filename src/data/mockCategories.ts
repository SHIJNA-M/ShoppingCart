import type { Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-clothing',
    name: 'Clothing',
    imageUrl: require('../assets/images/categories/clothing1.jpg'),
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    imageUrl: require('../assets/images/categories/accessories1.jpg'),
  },
  {
    id: 'cat-shoes',
    name: 'Shoes',
    imageUrl: require('../assets/images/categories/shoes1.jpg'),
  },
  {
    id: 'cat-bags',
    name: 'Bags',
    imageUrl: require('../assets/images/categories/bags1.jpg'),
  },
];
