import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import * as profileApi from '../../api/profile';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { bentoText } from '../../constants/bento';
import { openAppDrawer } from '../../utils/navigation';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';

const ROLE_COLORS = {
  admin: '#6C47FF',
  owner: '#6C47FF',
  member: '#22c55e',
  viewer: '#f59e0b',
};

const getRoleColor = (role) => ROLE_COLORS[(role || '').toLowerCase()] || '#6C47FF';

export const TeamMembersScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const showToast = useUiStore((state) => state.showToast);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await profileApi.getOrganizationMembers();
      const list = response?.data || response || [];
      // handle both array and {members: []} shape
      const list2 = Array.isArray(list) ? list : list.members || list.data || [];
      setMembers(list2);
    } catch (e) {
      console.warn('Members fetch failed:', e?.message);
      // Don't show error — fall back to the current user if we have one, else empty
      if (user?.email || user?.fullName) {
        setMembers([{
          id: user.id || user.email,
          fullName: user.fullName || user.name,
          email: user.email,
          role: user.role || 'owner',
        }]);
      } else {
        setMembers([]);
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchMembers().finally(() => setLoading(false));
  }, [fetchMembers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    fetchMembers().finally(() => setLoading(false));
  };

  const handleInvite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!user?.organizationCode) {
      showToast('No organization invite code available.', 'error');
      return;
    }
    await Clipboard.setStringAsync(user.organizationCode);
    showToast(`Invite code "${user.organizationCode}" copied to clipboard!`, 'success');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Team Members</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* ROW 1: Org card */}
        <BentoCard size="full" accent style={styles.orgCard}>
          <View style={styles.orgRow}>
            <View style={{ flex: 1 }}>
              <Text style={[bentoText.label, { color: 'rgba(255,255,255,0.75)' }]}>Organization</Text>
              <Text style={[styles.orgName, { color: '#ffffff' }]} numberOfLines={1}>
                {user?.organizationName || 'Your Organization'}
              </Text>
              <Text style={[bentoText.subtitle, { color: 'rgba(255,255,255,0.85)', marginTop: 4 }]}>
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={handleInvite} style={styles.inviteBtn}>
              <MaterialCommunityIcons name="account-plus-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.inviteBtnText, { color: colors.primary }]}>Invite</Text>
            </TouchableOpacity>
          </View>
        </BentoCard>

        {/* ROW 2+: Member cards, 2 per row */}
        {loading ? (
          <SkeletonCardList count={4} />
        ) : members.length === 0 ? (
          <View style={styles.emptyMembers}>
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color={colors.textSecondary}
              style={{ opacity: 0.4 }}
            />
            <Text style={[styles.emptyMembersText, { color: colors.text }]}>No members yet</Text>
            <Text style={[styles.emptyMembersSubtext, { color: colors.textSecondary }]}>
              Share your invite code to add team members
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRetry}
              style={[styles.retryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <MaterialCommunityIcons name="refresh" size={16} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.retryBtnText, { color: colors.primary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <BentoRow style={styles.membersWrap}>
            {members.map((member) => {
              const roleColor = getRoleColor(member.role);
              return (
                <BentoCard key={member.id || member.email} size="half" style={styles.memberCard}>
                  <Avatar
                    size={44}
                    name={member.fullName || member.email}
                    source={member.avatar || undefined}
                    color={roleColor}
                  />
                  <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                    {member.fullName || member.email}
                  </Text>
                  <Text style={[styles.memberEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                    {member.email}
                  </Text>
                  <Badge
                    text={(member.role || 'Member').toUpperCase()}
                    variant="neutral"
                    style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]}
                    textStyle={{ color: roleColor }}
                  />
                </BentoCard>
              );
            })}
          </BentoRow>
        )}
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
  orgCard: {
    marginBottom: 12,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  inviteBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  membersWrap: {
    flexWrap: 'wrap',
  },
  memberCard: {
    width: '48.5%',
  },
  memberName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  memberEmail: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  emptyMembers: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyMembersText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    opacity: 0.6,
  },
  emptyMembersSubtext: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  retryBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
});
export default TeamMembersScreen;
