import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
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

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>;
type PayMode = 'now' | 'later';

const formatPrice = (cents: number) => `$ ${(cents / 100).toFixed(2)}`;

// ── Pay Now payment data ──────────────────────────────────
const PAY_NOW_SECTIONS = [
  {
    id: 'upi',
    title: 'UPI',
    icon: '�',
    options: [
      { id: 'gpay',       label: 'Google Pay',  icon: '�' },
      { id: 'supermoney', label: 'SuperMoney',  icon: '�' },
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
      { id: 'sib',   label: 'South Indian Bank',    icon: '🟤' },
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

export default function CheckoutScreen({ route, navigation }: Props) {
  const { total } = route.params;
  const { clearCart } = useCart();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const [payMode, setPayMode]           = useState<PayMode>('now');
  const [selectedMethod, setSelected]   = useState<string>('gpay');
  const [expandedSection, setExpanded]  = useState<string>('upi');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType]       = useState<'payment' | 'order'>('payment');

  const handlePay = () => {
    setModalType(payMode === 'now' ? 'payment' : 'order');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    clearCart();
    navigation.popToTop();
  };

  const TAB_H = vs(64);
  const footerPad = TAB_H + (insets.bottom > 0 ? insets.bottom : vs(12));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
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
      >
        {/* ── Order Total card ── */}
        <View style={[styles.totalCard, { borderRadius: scale(14) }]}>
          <View>
            <Text style={[styles.totalCardLabel, { fontSize: ms(12) }]}>Order Total</Text>
            <Text style={[styles.totalCardValue, { fontSize: ms(24) }]}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.totalCardBadge}>
            <Text style={[styles.totalCardBadgeText, { fontSize: ms(11) }]}>Secure Payment</Text>
          </View>
        </View>

        {/* ── Pay Mode Toggle ── */}
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
              <Text style={[
                styles.toggleText,
                { fontSize: ms(14) },
                payMode === mode && styles.toggleTextActive,
              ]}>
                {mode === 'now' ? 'Pay Now' : 'Pay Later'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Pay Now: accordion sections ── */}
        {payMode === 'now' && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>Payment Method</Text>
            {PAY_NOW_SECTIONS.map((section) => {
              const isOpen = expandedSection === section.id;
              return (
                <View key={section.id} style={[styles.accordion, { borderRadius: scale(12), marginBottom: vs(10) }]}>
                  {/* Section header */}
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => setExpanded(isOpen ? '' : section.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionLeft}>
                      <Text style={styles.accordionIcon}>{section.icon}</Text>
                      <Text style={[styles.accordionTitle, { fontSize: ms(14) }]}>{section.title}</Text>
                    </View>
                    <Text style={[styles.chevron, { fontSize: ms(16), fontWeight : '700',  }]}>{isOpen ? '⌃' : '⌄'}</Text>
                  </TouchableOpacity>

                  {/* Options */}
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
                            {/* Radio */}
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

        {/* ── Pay Later: Cash on Delivery ── */}
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
                💡 Your order will be placed and delivered first. Payment is collected at the time of delivery.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Pay Button ── */}
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <TouchableOpacity
          style={[styles.payBtn, { borderRadius: scale(50), paddingVertical: vs(15) }]}
          onPress={handlePay}
          activeOpacity={0.85}
        >
          <Text style={[styles.payBtnText, { fontSize: ms(14) }]}>
            {payMode === 'now' ? `Pay  ${formatPrice(total)}` : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Success Modal ── */}
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

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vs(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backBtn:     { width: scale(40), height: scale(40), alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: ms(28), color: Colors.black, lineHeight: ms(32) },
  headerTitle: { fontWeight: '700', color: Colors.black },

  content: { padding: scale(16) },

  /* Total card */
  totalCard: {
    backgroundColor: '#1C1C1C',
    padding: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  totalCardLabel: { color: 'rgba(255,255,255,0.6)', marginBottom: vs(4) },
  totalCardValue: { color: Colors.white, fontWeight: '700' },
  totalCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scale(10),
    paddingVertical: vs(5),
    borderRadius: scale(20),
  },
  totalCardBadgeText: { color: Colors.white },

  /* Section title */
  sectionTitle: { fontWeight: '700', color: Colors.black, marginBottom: vs(10) },

  /* Toggle */
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  toggleBtn:       { flex: 1, paddingVertical: vs(12), alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#1C1C1C' },
  toggleText:      { fontWeight: '600', color: '#888' },
  toggleTextActive:{ color: Colors.white },

  /* Accordion */
  accordion: {
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vs(14),
  },
  accordionLeft:  { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  accordionIcon:  { fontSize: ms(18) },
  accordionTitle: { fontWeight: '600', color: Colors.black },
  chevron:        { color: '#888' },

  /* Options */
  optionsList: { borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: vs(13),
    gap: scale(12),
    backgroundColor: Colors.white,
  },
  optionBorder:       { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionRowSelected:  { backgroundColor: '#FAFAFA' },
  optionIcon:         { fontSize: ms(18) },
  optionLabel:        { flex: 1, color: '#444', fontWeight: '500' },
  optionLabelSelected:{ color: Colors.black, fontWeight: '600' },

  /* Radio */
  radio: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#1C1C1C' },
  radioDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: '#1C1C1C',
  },

  /* COD */
  codCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: scale(16),
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    gap: scale(12),
  },
  codCardSelected: { borderColor: '#1C1C1C', backgroundColor: '#FAFAFA' },
  codIcon:  { fontSize: ms(28) },
  codInfo:  { flex: 1 },
  codTitle: { fontWeight: '700', color: Colors.black },
  codSub:   { color: '#888', marginTop: vs(2) },

  infoBox:  { backgroundColor: '#FFF9E6', padding: scale(14), borderWidth: 1, borderColor: '#FFE58F' },
  infoText: { color: '#7A6000', lineHeight: ms(18) },

  /* Footer */
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: scale(16),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  payBtn:     { backgroundColor: '#1C1C1C', alignItems: 'center' },
  payBtnText: { color: Colors.white, fontWeight: '700', letterSpacing: 1.5 },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  modalCard:    { backgroundColor: Colors.white, alignItems: 'center', width: '100%' },
  modalEmoji:   { fontSize: ms(52), marginBottom: vs(12) },
  modalTitle:   { fontWeight: '700', color: Colors.black, marginBottom: vs(8), textAlign: 'center' },
  modalSub:     { color: '#666', textAlign: 'center', marginBottom: vs(20), lineHeight: ms(20) },
  modalBtn:     { backgroundColor: '#1C1C1C' },
  modalBtnText: { color: Colors.white, fontWeight: '700', letterSpacing: 1 },
});
