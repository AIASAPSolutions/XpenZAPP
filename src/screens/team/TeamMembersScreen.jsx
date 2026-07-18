import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as profileApi from '../../api/profile';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { openAppDrawer } from '../../utils/navigation';

// Custom elements
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';

export const TeamMembersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMembers = useCallback(async () => {
    setError(null);
    try {
      const res = await profileApi.getOrganizationMembers();
      setMembers(res.data || []);
    } catch (err) {
      setError('Failed to load team members.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadMembers().finally(() => setLoading(false));
  }, [loadMembers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={styles.menuBtn}
        >
          <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Team Members</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {loading ? (
          <SkeletonCardList count={4} />
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Something Went Wrong"
            description={error}
            actionTitle="Retry"
            onActionPress={() => {
              setLoading(true);
              loadMembers().finally(() => setLoading(false));
            }}
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="No Team Members Yet"
            description="Invite colleagues to your organization to see them here."
          />
        ) : (
          <View style={styles.memberList}>
            {members.map((member) => (
              <Card key={member.id || member.email} style={styles.memberCard} elevation="light">
                <Avatar size={48} name={member.fullName || member.email} source={member.avatar || undefined} />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                    {member.fullName || member.email}
                  </Text>
                  <Text style={[styles.memberEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                    {member.email}
                  </Text>
                </View>
                <Badge text={(member.role || 'Member').toUpperCase()} variant="primary" />
              </Card>
            ))}
          </View>
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
  memberList: {
    gap: spacing.md,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md + 2,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  memberName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  memberEmail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
  },
});
export default TeamMembersScreen;
