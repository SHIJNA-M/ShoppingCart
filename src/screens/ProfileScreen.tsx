import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/tokens';
import { scale, vs, ms } from '../utils/scale';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const user = state.user;
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const TAB_H = vs(64); // floating tab bar height

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: ms(22) }]}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(16),
          paddingTop: vs(24),
          paddingBottom: TAB_H + (insets.bottom > 0 ? insets.bottom : vs(16)) + vs(16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { width: scale(80), height: scale(80), borderRadius: scale(40) }]}>
            <Text style={[styles.avatarInitial, { fontSize: ms(28) }]}>
              {user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={[styles.userName, { fontSize: ms(18), marginTop: vs(10) }]}>
            {user?.fullName ?? ''}
          </Text>
          <Text style={[styles.userEmail, { fontSize: ms(13) }]}>
            {user?.email ?? ''}
          </Text>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { borderRadius: scale(12), marginBottom: vs(24) }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { fontSize: ms(14) }]}>Full Name</Text>
            <Text style={[styles.infoValue, { fontSize: ms(14) }]}>{user?.fullName ?? '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { fontSize: ms(14) }]}>Username</Text>
            <Text style={[styles.infoValue, { fontSize: ms(14) }]}>
              {user?.username ? `@${user.username}` : '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { fontSize: ms(14) }]}>Email</Text>
            <Text style={[styles.infoValue, { fontSize: ms(14) }]} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* Logout button — full width pill */}
        <TouchableOpacity
          style={[styles.logoutBtn, {
            borderRadius: scale(50),
            paddingVertical: vs(15),
            marginHorizontal: W * 0.1,
          }]}
          onPress={logout}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={[styles.logoutText, { fontSize: ms(14) }]}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: scale(16),
    paddingTop: vs(12),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title:      { fontWeight: '700', color: Colors.black },
  avatarContainer: { alignItems: 'center', marginBottom: vs(24) },
  avatar: {
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontWeight: '700', color: Colors.white },
  userName:   { fontWeight: '700', color: Colors.black },
  userEmail:  { color: '#666', marginTop: vs(4) },
  infoCard: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: scale(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(14),
  },
  infoLabel:  { color: '#666' },
  infoValue:  { color: Colors.black, fontWeight: '500', flexShrink: 1, marginLeft: scale(16), textAlign: 'right' },
  divider:    { height: 1, backgroundColor: '#E5E5E5' },
  logoutBtn: {
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: Colors.white, fontWeight: '700', letterSpacing: 1.5 },
});
