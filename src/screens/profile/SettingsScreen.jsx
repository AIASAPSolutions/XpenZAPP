import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { CONFIG } from '../../constants/config';

// Custom elements
import Card from '../../components/common/Card';
import Divider from '../../components/common/Divider';
import Button from '../../components/common/Button';
import { openAppDrawer } from '../../utils/navigation';
import { downloadAndShareExport } from '../../utils/exportDownload';

export const SettingsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { logout, biometricsEnabled, setBiometrics, defaultCurrency, setDefaultCurrency } = useAuth();

  // Theme state controls
  const storeTheme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const showToast = useUiStore((state) => state.showToast);

  // Notifications switches
  const [budgetAlerts, setBudgetAlerts] = React.useState(true);
  const [weeklySummary, setWeeklySummary] = React.useState(true);
  const [exporting, setExporting] = useState(false);

  const handleThemeChange = (selectedTheme) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(selectedTheme);
    showToast(`Theme updated to ${selectedTheme.toUpperCase()}`, "success");
  };

  const handleCurrencyChange = (curr) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDefaultCurrency(curr);
    showToast(`Default currency changed to ${curr}`, "success");
  };

  const handleExportData = async () => {
    if (exporting) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setExporting(true);
    showToast('Compiling transactions data as Excel...', 'success');
    try {
      await downloadAndShareExport();
      showToast('Excel export downloaded successfully!', 'success');
    } catch {
      showToast('Failed to export Excel data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Delete Corporate Account",
      "CAUTION: Deleting your account will permanently wipe out all logged expenses, project workspaces, and configuration files. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            showToast("Account deleted successfully.", "error");
            logout();
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PREFERENCES SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
        <Card style={styles.sectionCard} elevation="light">
          
          {/* Theme switcher */}
          <View style={styles.settingItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="palette-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
              <Text style={[styles.label, { color: colors.text }]}>Visual Style Theme</Text>
            </View>
            <View style={styles.chipRow}>
              {['light', 'dark', 'system'].map((t) => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => handleThemeChange(t)}
                  style={[
                    styles.themeChip,
                    { borderColor: colors.border },
                    storeTheme === t && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.text }]}>{t.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Divider />

          {/* Currency switcher */}
          <View style={styles.settingItem}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="currency-inr" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
              <Text style={[styles.label, { color: colors.text }]}>Default Currency</Text>
            </View>
            <View style={styles.chipRow}>
              {['INR', 'USD', 'EUR', 'GBP'].map((curr) => (
                <TouchableOpacity
                  key={curr}
                  activeOpacity={0.7}
                  onPress={() => handleCurrencyChange(curr)}
                  style={[
                    styles.themeChip,
                    { borderColor: colors.border },
                    defaultCurrency === curr && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.text }]}>{curr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </Card>

        {/* NOTIFICATIONS SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Alerts</Text>
        <Card style={styles.sectionCard} elevation="light">
          
          {/* Budget warnings */}
          <View style={styles.settingRowItem}>
            <View style={styles.rowLabelWrapper}>
              <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Budget Threshold Alerts</Text>
                <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Notify when category reaches alert targets</Text>
              </View>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBudgetAlerts(val);
              }}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <Divider />

          {/* Weekly reports */}
          <View style={styles.settingRowItem}>
            <View style={styles.rowLabelWrapper}>
              <MaterialCommunityIcons name="calendar-multiselect" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Weekly Corporate Summaries</Text>
                <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Dispatched push summaries of active projects</Text>
              </View>
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWeeklySummary(val);
              }}
              trackColor={{ true: colors.primary }}
            />
          </View>

        </Card>

        {/* SECURITY & DATA SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security & Data Management</Text>
        <Card style={styles.sectionCard} elevation="light">
          
          {/* Biometrics */}
          <View style={styles.settingRowItem}>
            <View style={styles.rowLabelWrapper}>
              <MaterialCommunityIcons name="fingerprint" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Biometrics Secure Auths</Text>
                <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Enable FaceID / Fingerprints locks</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBiometrics(val);
                showToast(val ? "Face ID lock activated." : "Biometrics disabled.", "success");
              }}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <Divider />

          {/* Export */}
          <TouchableOpacity activeOpacity={0.7} onPress={handleExportData} disabled={exporting} style={styles.clickableSettingRow}>
            <MaterialCommunityIcons name="database-export-outline" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Export Data (Excel Format)</Text>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>

          <Divider />

          {/* Wipe cache */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => showToast("Cache wiped successfully.", "success")} style={styles.clickableSettingRow}>
            <MaterialCommunityIcons name="cached" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Flush Cached Sessions</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <Divider />

          {/* Account deletion */}
          <TouchableOpacity activeOpacity={0.7} onPress={handleDeleteAccount} style={styles.clickableSettingRow}>
            <MaterialCommunityIcons name="account-remove-outline" size={22} color={colors.error} style={{ marginRight: spacing.md }} />
            <Text style={[styles.rowLabel, { color: colors.error }]}>Delete Corporate Account</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.error} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

        </Card>

        {/* ABOUT LOGS SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Corporate About</Text>
        <Card style={styles.sectionCard} elevation="light">
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Version</Text>
            <Text style={[styles.aboutVal, { color: colors.text }]}>{CONFIG.VERSION}</Text>
          </View>
          <Divider />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Developer Team</Text>
            <Text style={[styles.aboutVal, { color: colors.text }]}>{CONFIG.COMPANY}</Text>
          </View>
        </Card>

        {/* Bottom red logout btn */}
        <Button
          title="Sign Out of Corporate Account"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
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
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionCard: {
    padding: spacing.md + 2,
    marginBottom: spacing.md,
  },
  settingItem: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  themeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  settingRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  rowDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  clickableSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  aboutVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  logoutBtn: {
    width: '100%',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
});
export default SettingsScreen;
