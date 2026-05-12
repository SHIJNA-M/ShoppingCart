import React from 'react'; // Import React library
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'; // Import required React Native UI components
import { Colors, Spacing, Typography } from '../theme/tokens'; // Import reusable theme constants
import type { Product } from '../types'; // Import Product TypeScript type

// Define props structure for ProductCard component
interface ProductCardProps {
  product: Product; // Product object containing all product details
  wishlisted: boolean; // Whether product is in wishlist or not
  onPress: () => void;    // Function triggered when card pressed
  onWishlistToggle: () => void;  // Function triggered when wishlist button pressed
}


// Function to convert cents into formatted currency string
// Example: 4999 -> "$ 49.99"
const formatPrice = (cents: number): string => `$ ${(cents / 100).toFixed(2)}`;


// Create ProductCard functional component
const ProductCard: React.FC<ProductCardProps> = ({

    // Extract props directly

  product,
  wishlisted,
  onPress,
  onWishlistToggle,
}) => {

    // Get first image from product images array
  // If undefined/null, use empty string
  const imageUri = product.images[0] ?? '';

  // Derive a fake original price (~20% higher) for the strikethrough display
  const originalPrice = Math.round(product.price * 1.2);



   // Return component UI
  return (


     // Main clickable product card
    <TouchableOpacity

      style={styles.card} // Apply card styles      
      onPress={onPress} // Function called when card pressed
      activeOpacity={0.8} // Opacity effect when pressed
      accessibilityRole="button" // Accessibility role for screen readers
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`} // Accessibility label
      // Example: "Nike Shoes, $49.99"
    >

       {/* Image container */}
      <View style={styles.imageContainer}>
        {/* Product image */}
        <Image
        // Image source logic
          // If local image -> use directly
          // Else -> use uri object for remote image
          source={typeof imageUri === 'number' ? imageUri : { uri: imageUri as string }}
          
          style={styles.image}    // Apply image styles
          resizeMode="cover"   // Make image cover entire area
          accessibilityLabel={`Image of ${product.name}`} // Accessibility label
        />

          {/* Wishlist heart button */}
        <TouchableOpacity

          style={styles.wishlistButton}  // Apply wishlist button styles
          onPress={onWishlistToggle}    // Function called when heart pressed
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}   // Increase touchable area
          accessibilityRole="button"   // Accessibility role
          accessibilityLabel={   // Dynamic accessibility label
            wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          accessibilityState={{ selected: wishlisted }}  // Accessibility selected state
        >

           {/* Heart icon */}
          <Text   // Merge multiple style 
          style={[styles.heartIcon, wishlisted ? styles.heartActive : styles.heartInactive]}>
            {wishlisted ? '♥' : '♥'} {/* Heart icon character */}
          </Text>
        </TouchableOpacity>
      </View>


        {/* Product information section */}
      <View style={styles.info}>
        {/* Product name */}

        <Text style={styles.name} numberOfLines={2}>    {/*Apply text styles & Limit text to 2 lines */}
        
          {product.name}
        </Text>
        <View style={styles.priceRow}>   {/* Price row */}
          <Text style={styles.salePrice}>{formatPrice(product.price)}</Text>    {/* Format product price */} {/* Original crossed-out price */}
          <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>    {/* Original crossed-out price */}    {/* Format original price */}
        </View>


        {/* Star rating */}
        <View style={styles.ratingRow}>  {/* Create 5 stars dynamically */}
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}   // Unique key for React rendering
              style={[   // Merge star styles
                styles.star,  // Base star style
                star <= Math.round(product.rating) ? styles.starFilled : styles.starEmpty,    // Filled or empty star color
              ]}
            >
              ★
            </Text>
          ))}

   
            {/* Review count */}

          <Text style={styles.reviewCount}>({product.reviewCount})</Text>  {/* Display total reviews */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    margin: Spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 15,
    lineHeight: 18,
  },
  heartActive: {
    color: '#E53935',
  },
  heartInactive: {
    color: '#D8D8D8',

  },
  info: {
    padding: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.gray800,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  salePrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.black,
  },
  originalPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 11,
  },
  starFilled: {
    color: '#508A7B',
  },
  starEmpty: {
    color: Colors.gray200,
  },
  reviewCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    marginLeft: 2,
  },
});

export default ProductCard;
