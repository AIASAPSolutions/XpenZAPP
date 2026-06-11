import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

// Custom elements
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import { openAppDrawer } from '../../utils/navigation';

export const ProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={styles.menuBtn}
        >
          <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Corporate Profile</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleEditProfile} style={styles.menuBtn}>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE HEADER WRAPPER CARD */}
        <Card style={styles.profileCard} elevation="heavy">
          
          {/* Avatar display with photo trigger overlay */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleUploadPhoto} style={styles.avatarWrapper}>
            <Avatar size={100} name={user?.fullName || 'Rahul Sharma'} />
            <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="camera" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Rahul Sharma'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'rahul@asap.org'}</Text>
          
          <Badge text={user?.accountType?.toUpperCase() || 'ORGANIZATION'} variant="primary" style={styles.badge} />
        </Card>

        {/* PROFILE METRICS GRID */}
        <View style={styles.statsRow}>
          <Card style={styles.statCell} elevation="light">
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Logged Count</Text>
            <Text style={[styles.cellVal, { color: colors.text }]}>{user?.totalExpensesLogged || 28}</Text>
          </Card>

          <Card style={styles.statCell} elevation="light">
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Volume Tracked</Text>
            <Text style={[styles.cellVal, { color: colors.text }]}>₹{(user?.totalAmountTracked || 148200).toLocaleString()}</Text>
          </Card>
        </View>

        {/* CORPORATE SPECIFICS SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Company Associations</Text>
        <Card style={styles.detailsCard} elevation="light">
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="office-building" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <View>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Organization / Company</Text>
              <Text style={[styles.itemVal, { color: colors.text }]}>{user?.organizationName || 'AI ASAP Solutions'}</Text>
            </View>
          </View>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="card-account-details-outline" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <View>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Designation / Role</Text>
              <Text style={[styles.itemVal, { color: colors.text }]}>{user?.role || 'Director'}</Text>
            </View>
          </View>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <View>
              <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Member Joined Since</Text>
              <Text style={[styles.itemVal, { color: colors.text }]}>{user?.memberSince || 'May 2025'}</Text>
            </View>
          </View>

        </Card>

        {/* Change password button */}
        <Button
          title="Update Account Passwords"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Settings', { screen: 'ChangePassword' });
          }}
          variant="outline"
          style={styles.actionBtn}
        />

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
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 2,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 48,
  },
  profileCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCell: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  cellLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  detailsCard: {
    padding: spacing.md + 2,
    marginBottom: spacing.xl,
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
  actionBtn: {
    width: '100%',
  },
});
export default ProfileScreen;
