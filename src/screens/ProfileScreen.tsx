/**
 * ProfileScreen — displays user info and provides a logout action.
 * Requirements: 3.7, 7.4
 */
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Typography, BorderRadius } from '../theme/tokens';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const user = state.user;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar placeholder */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        </View>

        {/* User info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.fullName ?? '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>
              {user?.username ? `@${user.username}` : '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* Logout button */}
        <View style={styles.logoutContainer}>
          <PrimaryButton
            label="LOG OUT"
            onPress={logout}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.regular,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    flexShrink: 1,
    marginLeft: Spacing.md,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
  },
  logoutContainer: {
    marginTop: 'auto',
    paddingBottom: Spacing.lg,
  },
});
