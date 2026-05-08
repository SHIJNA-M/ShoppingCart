import type { Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-clothing',
    name: 'Clothing',
    imageUrl: require('../assets/images/categories/clothing.png'),
    imgWidth: 149,
    imgHeight: 146,
    top: 0,
     left: 183,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    imageUrl: require('../assets/images/categories/accessories1.png'),
    imgWidth: 194,
    imgHeight: 129,
    top: -6,
    left: 187

  },
  {
    id: 'cat-shoes',
    name: 'Shoes',
    imageUrl: require('../assets/images/categories/shoes1.png'),
    imgWidth: 125,
    imgHeight: 190,
    top: 0,
    left: 190,
  },
  {
    id: 'cat-bags',
    name: 'Bags',
    imageUrl: require('../assets/images/categories/shoes.png'),
    imgWidth: 83,
    imgHeight: 125,
    top: 0,
    left: 211,
  },
];
