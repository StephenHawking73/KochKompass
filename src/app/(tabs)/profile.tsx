import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import {
  changePassword,
  getProfile,
  removeAvatarImage,
  updateProfileDetails,
  updateProfileEmail,
  updateProfileMaxMeat,
  uploadAvatarImage,
} from '@/services/profileService';
import ProfileCard from '@/components/profile/ProfileCard';
import { icons } from '@/assets/icons';
import { ProfileType } from '@/types/profile';
import ProfileMenuSection from '@/components/profile/profileMenuSection';
import { useThemeMode } from '@/hooks/useThemeMode';
import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import BasicBottomSheet from '@/components/BasicBottomSheet';
import DevelopmentNotice from '@/components/DevelopmentNotice';
import { useAuth } from '@/providers/AuthProvider';
import { useAppAlert } from '@/providers/AlertProvider';
import { getActiveGroup } from '@/services/groupService';

const MAX_AVATAR_SIZE_MB = 5;

function getFriendlyErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('failed to fetch')) {
      return 'Bitte prüfe deine Internetverbindung und versuche es erneut.';
    }

    if (message.includes('session') || message.includes('token') || message.includes('jwt')) {
      return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
    }

    if (message.includes('permission') || message.includes('policy') || message.includes('rls')) {
      return 'Du hast keine Berechtigung für diese Änderung.';
    }

    if (message.includes('already registered') || message.includes('already exists') || message.includes('email already') || message.includes('duplicate')) {
      return 'Diese E-Mail-Adresse wird bereits verwendet.';
    }

    if (message.includes('normalization') || message.includes('invalid email')) {
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    }

    if (message.includes('weak password') || message.includes('password should')) {
      return 'Das Passwort ist zu schwach. Bitte nutze eine längere und sicherere Kombination.';
    }

    if (message.includes('wrong password') || message.includes('incorrect password') || message.includes('invalid login credentials')) {
      return 'Das aktuelle Passwort ist falsch.';
    }
  }

  return fallback;
}

export default function Profile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { isDark, themeMode, setThemeMode } = useThemeMode();
  const { activeGroupId, refreshActiveGroup } = useAuth();
  const { showAlert } = useAppAlert();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null);
  const [themeSheetVisible, setThemeSheetVisible] = useState(false);
  const [meatLimitSheetVisible, setMeatLimitSheetVisible] = useState(false);
  const [maxMeatSetting, setMaxMeatSetting] = useState(3);
  const [savingMaxMeat, setSavingMaxMeat] = useState(false);
  const [devNoticeVisible, setDevNoticeVisible] = useState(false);
  const [devNoticeContent, setDevNoticeContent] = useState({ title: '', message: '' });

  const loadProfileAndGroup = useCallback(async () => {
    const profileData = await getProfile();
    setProfile(profileData);
    setMaxMeatSetting(profileData?.max_meat ?? 3);

    if (!activeGroupId) {
      setActiveGroupName(null);
      return;
    }

    const group = await getActiveGroup();
    setActiveGroupName(group?.name ?? null);
  }, [activeGroupId]);

  useFocusEffect(
    useCallback(() => {
      const refreshProfile = async () => {
        await refreshActiveGroup();
        await loadProfileAndGroup();
      };

      refreshProfile();
    }, [loadProfileAndGroup, refreshActiveGroup])
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  const openDevNotice = (type: 'language' | 'notifications') => {
    const message =
      type === 'language'
        ? {
            title: 'Sprache kommt bald',
            message: 'Die Sprachoptionen werden gerade vorbereitet. Bald kannst du die App auch in deiner bevorzugten Sprache nutzen.',
          }
        : {
            title: 'Benachrichtigungen kommen bald',
            message: 'Die Benachrichtigungseinstellungen werden noch für dich eingebaut. Danach kannst du deine Erinnerungen ganz bequem steuern.',
          };

    setDevNoticeContent(message);
    setDevNoticeVisible(true);
  };

  const handleThemeChange = () => {
    setThemeSheetVisible(true);
  };

  const selectThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setThemeSheetVisible(false);
  };

  const getThemeLabel = (mode: typeof themeMode) => {
    switch (mode) {
      case 'dark':
        return 'Dunkel';
      case 'light':
        return 'Hell';
      default:
        return 'System';
    }
  };

  const handleSavePrivateMeatLimit = async () => {
    try {
      setSavingMaxMeat(true);
      await updateProfileMaxMeat(maxMeatSetting);
      setProfile((current) => (current ? { ...current, max_meat: maxMeatSetting } : current));
      setMeatLimitSheetVisible(false);
    } catch (error: unknown) {
      showAlert({
        title: 'Fehler',
        message: getFriendlyErrorMessage(error, 'Einstellung konnte nicht gespeichert werden.'),
      });
    } finally {
      setSavingMaxMeat(false);
    }
  };

  const group = [
    {
      title: 'Meine Gruppe',
      subtitle: activeGroupId ? (activeGroupName ?? 'Aktive Gruppe') : 'Keine Gruppe',
      icon: icons.person({ color: theme.text.primary, size: 20 }),
      onPress: () => router.push('/group' as any),
    },
  ];

  const settings = useMemo(
    () => [
      ...(!activeGroupId
        ? [{
            title: 'Max. Fleisch pro Woche',
            subtitle: `${profile?.max_meat ?? maxMeatSetting ?? 3} Fleischgerichte`,
            icon: icons.meat({ color: theme.text.primary, size: 20 }),
            onPress: () => {
              setMaxMeatSetting(profile?.max_meat ?? 3);
              setMeatLimitSheetVisible(true);
            },
          }]
        : []),
      {
        title: 'Design',
        subtitle: getThemeLabel(themeMode),
        icon: isDark ? icons.moon({ color: theme.text.primary, size: 20 }) : icons.sun({ color: theme.text.primary, size: 20 }),
        onPress: handleThemeChange,
      },
      {
        title: 'Sprache',
        icon: icons.globe({ color: theme.text.primary, size: 20 }),
        onPress: () => openDevNotice('language'),
      },
      {
        title: 'Benachrichtigungen',
        icon: icons.bell({ color: theme.text.primary, size: 20 }),
        onPress: () => openDevNotice('notifications'),
      },
    ],
    [activeGroupId, profile?.max_meat, maxMeatSetting, theme, themeMode, isDark]
  );

  const dangerZone = [
    {
      title: 'Ausloggen',
      icon: icons.exit({ color: theme.notification, size: 20 }),
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      {profile && (
        <ProfileCard
          username={profile.username}
          fullName={profile.full_name}
          avatar={profile.avatar_url}
          email={profile.email}
          onEditPress={() => router.push('/profile/edit')}
        />
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <ProfileMenuSection title="Meine Gruppe" items={group} />
        <ProfileMenuSection title="Einstellungen" items={settings} />
        <ProfileMenuSection title="Danger Zone" items={dangerZone} />
      </ScrollView>

      <BasicBottomSheet
        visible={themeSheetVisible}
        onClose={() => setThemeSheetVisible(false)}
        initialHeight={320}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Erscheinungsbild</Text>
          <Text style={styles.sheetSubtitle}>Wähle, wie die App dargestellt werden soll.</Text>

          {[
            { label: 'Hell', value: 'light' as const },
            { label: 'Dunkel', value: 'dark' as const },
            { label: 'System', value: 'system' as const },
          ].map((option) => {
            const isSelected = themeMode === option.value;

            return (
              <Pressable
                key={option.value}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => selectThemeMode(option.value)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {isSelected && <Text style={styles.optionCheck}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </BasicBottomSheet>

      <BasicBottomSheet
        visible={meatLimitSheetVisible}
        onClose={() => setMeatLimitSheetVisible(false)}
        initialHeight={290}
      >
        <View style={styles.meatLimitSheet}>
          <Text style={styles.sheetTitle}>Max. Fleischgerichte</Text>
          <Text style={styles.sheetSubtitle}>Wähle dein persönliches Limit für diese Woche.</Text>

          <View style={styles.meatLimitRow}>
            <Pressable
              style={styles.counterButton}
              onPress={() => setMaxMeatSetting((value) => Math.max(0, value - 1))}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </Pressable>

            <Text style={styles.meatLimitValue}>{maxMeatSetting}</Text>

            <Pressable
              style={styles.counterButton}
              onPress={() => setMaxMeatSetting((value) => Math.min(21, value + 1))}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.saveMeatLimitButton, savingMaxMeat && styles.saveMeatLimitButtonDisabled]}
            onPress={handleSavePrivateMeatLimit}
            disabled={savingMaxMeat}
          >
            <Text style={styles.saveMeatLimitText}>{savingMaxMeat ? 'Speichert...' : 'Speichern'}</Text>
          </Pressable>
        </View>
      </BasicBottomSheet>

      <DevelopmentNotice
        visible={devNoticeVisible}
        title={devNoticeContent.title}
        message={devNoticeContent.message}
        onClose={() => setDevNoticeVisible(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: 20,
  },

  sheetContent: {
    paddingTop: 4,
    gap: 12,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
  },

  sheetSubtitle: {
    fontSize: 14,
    color: theme.text.op,
    marginBottom: 6,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.card.background,
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? '#E5E5E5',
  },

  optionRowSelected: {
    backgroundColor: theme.button?.primary ?? theme.card.background,
    borderColor: theme.button?.primary ?? theme.tabBar.border ?? '#E5E5E5',
  },

  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },

  optionTextSelected: {
    color: theme.accent.primary,
  },

  optionCheck: {
    color: theme.accent.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  meatLimitSheet: {
    paddingTop: 4,
    gap: 18,
  },

  meatLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 8,
  },

  counterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterButtonText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 26,
  },

  meatLimitValue: {
    minWidth: 44,
    textAlign: 'center',
    color: theme.text.primary,
    fontSize: 30,
    fontWeight: '800',
  },

  saveMeatLimitButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveMeatLimitButtonDisabled: {
    opacity: 0.7,
  },

  saveMeatLimitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  profileSheet: {
    paddingBottom: 16,
    gap: 16,
  },

  avatarSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },

  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  profileAvatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileAvatarPlaceholderText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },

  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },

  primaryButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: theme.card.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? '#E5E5E5',
    alignItems: 'center',
  },

  secondaryButtonDisabled: {
    opacity: 0.6,
  },

  secondaryButtonText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  dangerInlineButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  dangerInlineButtonText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '700',
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? '#E5E5E5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.text.primary,
    fontSize: 15,
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    paddingRight: 42,
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },

  helperText: {
    fontSize: 12,
    color: theme.text.op,
    lineHeight: 18,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.tabBar.border ?? '#E5E5E5',
    marginVertical: 4,
  },

  sectionTitle: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  passwordHint: {
    color: theme.text.op,
    fontSize: 12,
    lineHeight: 18,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  successText: {
    color: '#166534',
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  cancelButtonText: {
    color: theme.accent.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});