import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../types';
import { Colors } from '../theme/tokens';
import { scale, vs, ms } from '../utils/scale';
import { useCart } from '../context/CartContext';
import { CartService, OrderService } from '../services/cartService';
import type { PaymentMethod, ShippingAddress } from '../services/cartService';

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>;
type PayMode = 'now' | 'later';

// API returns whole dollar amounts
const formatPrice = (price: number) => `$ ${price.toFixed(2)}`;

const PAY_NOW_SECTIONS = [
  {
    id: 'upi',
    title: 'UPI',
    icon: '📱',
    options: [
      { id: 'gpay',       label: 'Google Pay',  icon: '🟢' },
      { id: 'paytm_upi',  label: 'Paytm',       icon: '🔵' },
      { id: 'phonepe',    label: 'PhonePe',     icon: '🟣' },
    ],
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    icon: '🏦',
    options: [
      { id: 'hdfc',  label: 'HDFC Bank',           icon: '🔴' },
      { id: 'sbi',   label: 'State Bank of India',  icon: '🔵' },
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet',
    icon: '👛',
    options: [
      { id: 'paytm_w',   label: 'Paytm',    icon: '🔵' },
      { id: 'phonepe_w', label: 'PhonePe',  icon: '🟣' },
    ],
  },
];

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

export default function CheckoutScreen({ route, navigation }: Props) {
  const { total } = route.params;
  const { clearCart } = useCart();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const [payMode, setPayMode]           = useState<PayMode>('now');
  const [selectedMethod, setSelected]   = useState<string>('gpay');
  const [expandedSection, setExpanded]  = useState<string>('upi');
  const [address, setAddress]           = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing]       = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType]       = useState<'payment' | 'order'>('payment');
  const [orderError, setOrderError]     = useState<string | null>(null);

  const validateAddress = (): boolean => {
    const required: (keyof ShippingAddress)[] = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (const field of required) {
      if (!address[field].trim()) {
        setAddressError(`Please fill in ${field}`);
        return false;
      }
    }
    setAddressError(null);
    return true;
  };

  const handlePay = async () => {
    if (!validateAddress()) return;

    const paymentMethod: PaymentMethod = payMode === 'later' ? 'cod' : 'online';

    setIsPlacing(true);
    setOrderError(null);

    try {
      // Create order via API
      await OrderService.createOrder(address, paymentMethod);
      // Clear cart locally + API
      clearCart();
      CartService.clearCart().catch((err) =>
        console.warn('[Cart] clear sync failed:', err.message),
      );
      setModalType(payMode === 'now' ? 'payment' : 'order');
      setModalVisible(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setOrderError(msg);
    } finally {
      setIsPlacing(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.popToTop();
  };

  const TAB_H = vs(64);
  const footerPad = TAB_H + (insets.bottom > 0 ? insets.bottom : vs(12));

  const field = (
    label: string,
    key: keyof ShippingAddress,
    placeholder: string,
    keyboardType: 'default' | 'phone-pad' | 'numeric' = 'default',
  ) => (
    <View style={styles.fieldWrap} key={key}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        value={address[key]}
        onChangeText={(v) => setAddress((prev) => ({ ...prev, [key]: v }))}
        keyboardType={keyboardType}
        autoCapitalize="words"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: ms(18) }]}>Checkout</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: footerPad + vs(16) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Total */}
        <View style={[styles.totalCard, { borderRadius: scale(14) }]}>
          <View>
            <Text style={[styles.totalCardLabel, { fontSize: ms(12) }]}>Order Total</Text>
            <Text style={[styles.totalCardValue, { fontSize: ms(24) }]}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.totalCardBadge}>
            <Text style={[styles.totalCardBadgeText, { fontSize: ms(11) }]}>Secure Payment</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>Shipping Address</Text>
        <View style={[styles.addressCard, { borderRadius: scale(12), marginBottom: vs(20) }]}>
          {field('Full Name', 'fullName', 'John Doe')}
          {field('Phone', 'phone', '+91 9876543210', 'phone-pad')}
          {field('Street', 'street', '123 Main Street')}
          {field('City', 'city', 'Mumbai')}
          {field('State', 'state', 'Maharashtra')}
          {field('ZIP Code', 'zipCode', '400001', 'numeric')}
          {field('Country', 'country', 'India')}
          {addressError && (
            <Text style={styles.addressError}>{addressError}</Text>
          )}
        </View>

        {/* Pay Mode Toggle */}
        <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>Payment Option</Text>
        <View style={[styles.toggleRow, { borderRadius: scale(12), marginBottom: vs(20) }]}>
          {(['now', 'later'] as PayMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.toggleBtn, payMode === mode && styles.toggleBtnActive]}
              onPress={() => {
                setPayMode(mode);
                setSelected(mode === 'later' ? 'cod' : 'gpay');
                setExpanded('upi');
              }}
            >
              <Text style={[styles.toggleText, { fontSize: ms(14) }, payMode === mode && styles.toggleTextActive]}>
                {mode === 'now' ? 'Pay Now' : 'Pay Later'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay Now: accordion */}
        {payMode === 'now' && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>Payment Method</Text>
            {PAY_NOW_SECTIONS.map((section) => {
              const isOpen = expandedSection === section.id;
              return (
                <View key={section.id} style={[styles.accordion, { borderRadius: scale(12), marginBottom: vs(10) }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => setExpanded(isOpen ? '' : section.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionLeft}>
                      <Text style={styles.accordionIcon}>{section.icon}</Text>
                      <Text style={[styles.accordionTitle, { fontSize: ms(14) }]}>{section.title}</Text>
                    </View>
                    <Text style={[styles.chevron, { fontSize: ms(16), fontWeight: '700' }]}>{isOpen ? '⌃' : '⌄'}</Text>
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.optionsList}>
                      {section.options.map((opt, idx) => {
                        const isSelected = selectedMethod === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[
                              styles.optionRow,
                              idx < section.options.length - 1 && styles.optionBorder,
                              isSelected && styles.optionRowSelected,
                            ]}
                            onPress={() => setSelected(opt.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.optionIcon}>{opt.icon}</Text>
                            <Text style={[styles.optionLabel, { fontSize: ms(13) }, isSelected && styles.optionLabelSelected]}>
                              {opt.label}
                            </Text>
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Pay Later: COD */}
        {payMode === 'later' && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>Payment Method</Text>
            <TouchableOpacity
              style={[styles.codCard, { borderRadius: scale(12) }, selectedMethod === 'cod' && styles.codCardSelected]}
              onPress={() => setSelected('cod')}
              activeOpacity={0.8}
            >
              <Text style={styles.codIcon}>📦</Text>
              <View style={styles.codInfo}>
                <Text style={[styles.codTitle, { fontSize: ms(15) }]}>Cash on Delivery</Text>
                <Text style={[styles.codSub, { fontSize: ms(12) }]}>Pay when your order arrives</Text>
              </View>
              <View style={[styles.radio, selectedMethod === 'cod' && styles.radioSelected]}>
                {selectedMethod === 'cod' && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
            <View style={[styles.infoBox, { borderRadius: scale(10), marginTop: vs(12) }]}>
              <Text style={[styles.infoText, { fontSize: ms(12) }]}>
                💡 Your order will be placed and delivered first. Payment is collected at delivery.
              </Text>
            </View>
          </>
        )}

        {/* Order error */}
        {orderError && (
          <Text style={styles.orderError}>{orderError}</Text>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <TouchableOpacity
          style={[styles.payBtn, { borderRadius: scale(50), paddingVertical: vs(15) }, isPlacing && styles.payBtnDisabled]}
          onPress={handlePay}
          activeOpacity={0.85}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={[styles.payBtnText, { fontSize: ms(14) }]}>
              {payMode === 'now' ? `Pay  ${formatPrice(total)}` : 'Place Order'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleModalClose}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { borderRadius: scale(20), padding: scale(28) }]}>
            <Text style={styles.modalEmoji}>{modalType === 'payment' ? '✅' : '📦'}</Text>
            <Text style={[styles.modalTitle, { fontSize: ms(20) }]}>
              {modalType === 'payment' ? 'Payment Successful!' : 'Order Placed!'}
            </Text>
            <Text style={[styles.modalSub, { fontSize: ms(13) }]}>
              {modalType === 'payment'
                ? `Your payment of ${formatPrice(total)} was processed. Your order is confirmed!`
                : 'Your order has been placed. Pay on delivery when it arrives.'}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { borderRadius: scale(50), paddingVertical: vs(13), paddingHorizontal: scale(32) }]}
              onPress={handleModalClose}
            >
              <Text style={[styles.modalBtnText, { fontSize: ms(14) }]}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: scale(16), paddingVertical: vs(12),
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
  },
  backBtn:     { width: scale(40), height: scale(40), alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: ms(28), color: Colors.black, lineHeight: ms(32) },
  headerTitle: { fontWeight: '700', color: Colors.black },
  content: { padding: scale(16) },

  totalCard: {
    backgroundColor: '#1C1C1C', padding: scale(20),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: vs(20),
  },
  totalCardLabel:     { color: 'rgba(255,255,255,0.6)', marginBottom: vs(4) },
  totalCardValue:     { color: Colors.white, fontWeight: '700' },
  totalCardBadge:     { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: scale(10), paddingVertical: vs(5), borderRadius: scale(20) },
  totalCardBadgeText: { color: Colors.white },

  sectionTitle: { fontWeight: '700', color: Colors.black, marginBottom: vs(10) },

  // Address
  addressCard: { backgroundColor: Colors.white, padding: scale(16), borderWidth: 1, borderColor: '#EFEFEF', marginBottom: vs(4) },
  fieldWrap:   { marginBottom: vs(12) },
  fieldLabel:  { fontSize: ms(12), fontWeight: '600', color: '#555', marginBottom: vs(4) },
  fieldInput:  {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: scale(8),
    paddingHorizontal: scale(12), paddingVertical: vs(10),
    fontSize: ms(13), color: Colors.black, backgroundColor: '#FAFAFA',
  },
  addressError: { fontSize: ms(12), color: Colors.error, marginTop: vs(4) },
  orderError:   { fontSize: ms(13), color: Colors.error, textAlign: 'center', marginTop: vs(12) },

  toggleRow:       { flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1, borderColor: '#E5E5E5', overflow: 'hidden' },
  toggleBtn:       { flex: 1, paddingVertical: vs(12), alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#1C1C1C' },
  toggleText:      { fontWeight: '600', color: '#888' },
  toggleTextActive:{ color: Colors.white },

  accordion:       { backgroundColor: Colors.white, overflow: 'hidden', borderWidth: 1, borderColor: '#EFEFEF' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingVertical: vs(14) },
  accordionLeft:   { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  accordionIcon:   { fontSize: ms(18) },
  accordionTitle:  { fontWeight: '600', color: Colors.black },
  chevron:         { color: '#888' },

  optionsList:        { borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  optionRow:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: vs(13), gap: scale(12), backgroundColor: Colors.white },
  optionBorder:       { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionRowSelected:  { backgroundColor: '#FAFAFA' },
  optionIcon:         { fontSize: ms(18) },
  optionLabel:        { flex: 1, color: '#444', fontWeight: '500' },
  optionLabelSelected:{ color: Colors.black, fontWeight: '600' },

  radio:         { width: scale(20), height: scale(20), borderRadius: scale(10), borderWidth: 2, borderColor: '#CCC', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#1C1C1C' },
  radioDot:      { width: scale(10), height: scale(10), borderRadius: scale(5), backgroundColor: '#1C1C1C' },

  codCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: scale(16), borderWidth: 1.5, borderColor: '#E5E5E5', gap: scale(12) },
  codCardSelected:{ borderColor: '#1C1C1C', backgroundColor: '#FAFAFA' },
  codIcon:        { fontSize: ms(28) },
  codInfo:        { flex: 1 },
  codTitle:       { fontWeight: '700', color: Colors.black },
  codSub:         { color: '#888', marginTop: vs(2) },
  infoBox:        { backgroundColor: '#FFF9E6', padding: scale(14), borderWidth: 1, borderColor: '#FFE58F' },
  infoText:       { color: '#7A6000', lineHeight: ms(18) },

  footer:          { backgroundColor: Colors.white, paddingHorizontal: scale(16), paddingTop: vs(12), borderTopWidth: 1, borderTopColor: '#EFEFEF' },
  payBtn:          { backgroundColor: '#1C1C1C', alignItems: 'center' },
  payBtnDisabled:  { opacity: 0.6 },
  payBtnText:      { color: Colors.white, fontWeight: '700', letterSpacing: 1.5 },

  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: scale(24) },
  modalCard:  { backgroundColor: Colors.white, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: ms(52), marginBottom: vs(12) },
  modalTitle: { fontWeight: '700', color: Colors.black, marginBottom: vs(8), textAlign: 'center' },
  modalSub:   { color: '#666', textAlign: 'center', marginBottom: vs(20), lineHeight: ms(20) },
  modalBtn:   { backgroundColor: '#1C1C1C' },
  modalBtnText: { color: Colors.white, fontWeight: '700', letterSpacing: 1 },
});
