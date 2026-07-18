import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { bentoText } from '../../constants/bento';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { openAppDrawer } from '../../utils/navigation';

export const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, updateProfile } = useAuth();
  const showToast = useUiStore((state) => state.showToast);

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Update Profile Details",
      "Enter your full name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async (name) => {
            if (!name?.trim()) return;
            const res = await updateProfile({ fullName: name.trim() });
            if (res.success) {
              showToast("Profile details updated successfully!", "success");
            } else {
              showToast(res.error, "error");
            }
          }
        }
      ],
      "plain-text",
      user?.fullName
    );
  };

  const handleUploadPhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast("Photo upload simulator active.", "success");
  };

  const handleCopyCode = async (value, label) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`${label} copied to clipboard!`, "success");
  };

  const SETTINGS_LINKS = [
    { id: 'settings', icon: 'cog-outline', label: 'Account Settings', onPress: () => navigation.navigate('Settings') },
    { id: 'password', icon: 'lock-outline', label: 'Update Account Password', onPress: () => navigation.navigate('Settings', { screen: 'ChangePassword' }) },
    { id: 'team', icon: 'account-group-outline', label: 'Team Members', onPress: () => navigation.navigate('TeamMembers') },
    { id: 'export', icon: 'database-export-outline', label: 'Data Export', onPress: () => navigation.navigate('DataExport') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Corporate Profile</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleEditProfile}
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ROW 1: Large profile card */}
        <BentoCard size="full" style={styles.profileCard}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleUploadPhoto} style={styles.avatarWrapper}>
            <Avatar size={88} name={user?.fullName || 'Rahul Sharma'} />
            <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="camera" size={13} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Rahul Sharma'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'rahul@asap.org'}</Text>

          <Badge text={(user?.role || 'Member').toUpperCase()} variant="primary" style={styles.badge} />
        </BentoCard>

        {/* ROW 2: Invite codes with copy */}
        <BentoRow>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Personal Invite Code</Text>
            <Text style={[styles.codeVal, { color: colors.text }]} numberOfLines={1}>
              {user?.inviteCode || '—'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopyCode(user?.inviteCode, 'Personal invite code')}
              style={[styles.copyBtn, { borderColor: colors.border }]}
              disabled={!user?.inviteCode}
            >
              <MaterialCommunityIcons name="content-copy" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy</Text>
            </TouchableOpacity>
          </BentoCard>

          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Org Invite Code</Text>
            <Text style={[styles.codeVal, { color: colors.text }]} numberOfLines={1}>
              {user?.organizationCode || '—'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopyCode(user?.organizationCode, 'Organization invite code')}
              style={[styles.copyBtn, { borderColor: colors.border }]}
              disabled={!user?.organizationCode}
            >
              <MaterialCommunityIcons name="content-copy" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy</Text>
            </TouchableOpacity>
          </BentoCard>
        </BentoRow>

        {/* ROW 3: Account info */}
        <BentoCard size="half">
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>Account Info</Text>
          <View style={styles.accountInfoRow}>
            <MaterialCommunityIcons name="calendar-range" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[bentoText.subtitle, { color: colors.text }]}>Since {user?.memberSince || 'May 2025'}</Text>
          </View>
          <View style={styles.accountInfoRow}>
            <MaterialCommunityIcons name="account-badge-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[bentoText.subtitle, { color: colors.text, textTransform: 'capitalize' }]}>
              {user?.accountType || 'Individual'} account
            </Text>
          </View>
        </BentoCard>

        {/* Company associations */}
        <BentoCard size="full">
          <Text style={[bentoText.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>Company Associations</Text>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="office-building" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <View>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Organization</Text>
              <Text style={[styles.itemVal, { color: colors.text }]}>{user?.organizationName || 'AI ASAP Solutions'}</Text>
            </View>
          </View>

          <View style={[styles.detailItem, { marginTop: spacing.md }]}>
            <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <View>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Designation / Role</Text>
              <Text style={[styles.itemVal, { color: colors.text }]}>{user?.role || 'Director'}</Text>
            </View>
          </View>
        </BentoCard>

        {/* ROW 4: Settings quick links */}
        <Text style={[bentoText.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>Settings</Text>
        <View style={styles.linksList}>
          {SETTINGS_LINKS.map((link) => (
            <TouchableOpacity
              key={link.id}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                link.onPress();
              }}
            >
              <BentoCard style={styles.linkCard}>
                <MaterialCommunityIcons name={link.icon} size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                <Text style={[styles.linkLabel, { color: colors.text }]}>{link.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </BentoCard>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 2,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.md,
    paddingBottom: 48,
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs - 2,
  },
  userEmail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.md,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
  },
  codeVal: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: typography.weights.bold,
    marginTop: 6,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  copyBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  linksList: {
    gap: spacing.sm,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  linkLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
  },
});
export default ProfileScreen;
