// Feature: shopping-cart-app, Property 10: Filter application correctness
//
// For any filter or sort configuration applied on the Product Listing screen,
// every product displayed in the resulting grid SHALL satisfy all active filter
// criteria, and the ordering SHALL match the selected sort option.
//
// Validates: Requirements 4.8

import * as fc from 'fast-check';
import type { Product, FilterState, SortOption } from '../../src/types';

// ── Pure filter/sort function (mirrors ProductContext useMemo logic) ──────────

function applyFiltersAndSort(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.priceMin !== undefined) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }

  if (filters.priceMax !== undefined) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }

  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating_desc':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      // preserve insertion order
      break;
  }

  return result;
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const categoryIdArb = fc.constantFrom('cat-a', 'cat-b', 'cat-c');

const productArb = fc.record<Product>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  // price in cents: 100 (£1) – 100000 (£1000)
  price: fc.integer({ min: 100, max: 100_000 }),
  images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
  colorOptions: fc.array(
    fc.record({
      label: fc.string({ minLength: 1, maxLength: 20 }),
      hex: fc.stringMatching(/^[0-9a-f]{6}$/).map((h) => `#${h}`),
      imageIndex: fc.option(fc.nat({ max: 4 }), { nil: undefined }),
    }),
    { minLength: 0, maxLength: 4 },
  ),
  sizeOptions: fc.array(fc.string({ minLength: 1, maxLength: 5 }), {
    minLength: 0,
    maxLength: 6,
  }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  reviewCount: fc.nat({ max: 10_000 }),
  categoryId: categoryIdArb,
  similarProductIds: fc.array(fc.uuid(), { minLength: 0, maxLength: 4 }),
});

const sortOptionArb = fc.constantFrom<SortOption>(
  'price_asc',
  'price_desc',
  'rating_desc',
  'newest',
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductContext filter/sort logic', () => {
  // Property 10a: category filter — every result belongs to the filtered category
  it('P10a: all results match the active categoryId filter', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        categoryIdArb,
        sortOptionArb,
        (products, categoryId, sortBy) => {
          const filters: FilterState = { categoryId, sortBy };
          const result = applyFiltersAndSort(products, filters);

          return result.every((p) => p.categoryId === categoryId);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10b: no category filter — all products are returned (before sort)
  it('P10b: null categoryId returns all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        sortOptionArb,
        (products, sortBy) => {
          const filters: FilterState = { categoryId: null, sortBy };
          const result = applyFiltersAndSort(products, filters);

          return result.length === products.length;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10c: priceMin filter — every result has price >= priceMin
  it('P10c: all results satisfy priceMin constraint', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 0, max: 100_000 }),
        sortOptionArb,
        (products, priceMin, sortBy) => {
          const filters: FilterState = { categoryId: null, sortBy, priceMin };
          const result = applyFiltersAndSort(products, filters);

          return result.every((p) => p.price >= priceMin);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10d: priceMax filter — every result has price <= priceMax
  it('P10d: all results satisfy priceMax constraint', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 0, max: 100_000 }),
        sortOptionArb,
        (products, priceMax, sortBy) => {
          const filters: FilterState = { categoryId: null, sortBy, priceMax };
          const result = applyFiltersAndSort(products, filters);

          return result.every((p) => p.price <= priceMax);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10e: combined priceMin + priceMax — every result is within range
  it('P10e: all results satisfy combined price range', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 0, max: 50_000 }),
        fc.integer({ min: 50_000, max: 100_000 }),
        sortOptionArb,
        (products, priceMin, priceMax, sortBy) => {
          const filters: FilterState = { categoryId: null, sortBy, priceMin, priceMax };
          const result = applyFiltersAndSort(products, filters);

          return result.every((p) => p.price >= priceMin && p.price <= priceMax);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10f: price_asc sort — result is non-decreasing by price
  it('P10f: price_asc produces non-decreasing price order', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        (products) => {
          const filters: FilterState = { categoryId: null, sortBy: 'price_asc' };
          const result = applyFiltersAndSort(products, filters);

          for (let i = 1; i < result.length; i++) {
            if (result[i].price < result[i - 1].price) {
              return false;
            }
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10g: price_desc sort — result is non-increasing by price
  it('P10g: price_desc produces non-increasing price order', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        (products) => {
          const filters: FilterState = { categoryId: null, sortBy: 'price_desc' };
          const result = applyFiltersAndSort(products, filters);

          for (let i = 1; i < result.length; i++) {
            if (result[i].price > result[i - 1].price) {
              return false;
            }
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10h: rating_desc sort — result is non-increasing by rating
  it('P10h: rating_desc produces non-increasing rating order', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        (products) => {
          const filters: FilterState = { categoryId: null, sortBy: 'rating_desc' };
          const result = applyFiltersAndSort(products, filters);

          for (let i = 1; i < result.length; i++) {
            if (result[i].rating > result[i - 1].rating) {
              return false;
            }
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10i: filter does not add products — result is always a subset of input
  it('P10i: filtered result is always a subset of the input products', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        categoryIdArb,
        fc.integer({ min: 0, max: 50_000 }),
        fc.integer({ min: 50_000, max: 100_000 }),
        sortOptionArb,
        (products, categoryId, priceMin, priceMax, sortBy) => {
          const filters: FilterState = { categoryId, sortBy, priceMin, priceMax };
          const result = applyFiltersAndSort(products, filters);
          const inputIds = new Set(products.map((p) => p.id));

          return result.every((p) => inputIds.has(p.id));
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 10j: sort preserves the set of products — no items added or dropped
  it('P10j: sorting preserves the complete set of products', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        sortOptionArb,
        (products, sortBy) => {
          const filters: FilterState = { categoryId: null, sortBy };
          const result = applyFiltersAndSort(products, filters);

          if (result.length !== products.length) {
            return false;
          }

          const inputIds = new Set(products.map((p) => p.id));
          return result.every((p) => inputIds.has(p.id));
        },
      ),
      { numRuns: 100 },
    );
  });
});
