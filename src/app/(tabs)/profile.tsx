import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'
import { getProfile } from '@/services/profileService';
import ProfileCard from '@/components/profile/ProfileCard';
import { icons } from '@/assets/icons';
import { ProfileType } from '@/types/profile';
import ProfileMenuSection from '@/components/profile/profileMenuSection';
import { useThemeMode } from '@/hooks/useThemeMode';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import BasicBottomSheet from '@/components/BasicBottomSheet';
import DevelopmentNotice from '@/components/DevelopmentNotice';
import { useAuth } from '@/providers/AuthProvider';

export default function Profile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {isDark, themeMode, setThemeMode} = useThemeMode();
  const { activeGroupId } = useAuth();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [themeSheetVisible, setThemeSheetVisible] = useState(false);
  const [devNoticeVisible, setDevNoticeVisible] = useState(false);
  const [devNoticeContent, setDevNoticeContent] = useState({ title: '', message: '' });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getProfile()
      setProfile(data)
    }

    loadProfile()
  }, [])

  const handleLogout = async() => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

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

  const settings = [
    {
      title: "Meine Gruppe",
      subtitle: activeGroupId ? "Aktive Gruppe" : "Keine Gruppe",
      icon: icons.person({color: theme.text.primary, size: 20}),
      onPress: () => router.push('/group' as any)
    },
    {
      title: "Design",
      subtitle: getThemeLabel(themeMode),
      icon: isDark ? icons.moon({color: theme.text.primary, size: 20}): icons.sun({color: theme.text.primary, size: 20}),
      onPress: handleThemeChange
    },
    {
      title: "Sprache",
      icon: icons.globe({color: theme.text.primary, size: 20}),
      onPress: () => openDevNotice('language')
    },
    {
      title: "Benachrichtigungen",
      icon: icons.bell({color: theme.text.primary, size: 20}),
      onPress: () => openDevNotice('notifications')
    }
  ]

  const dangerZone = [
    {
      title: "Ausloggen",
      icon: icons.exit({color: theme.notification, size: 20}),
      onPress: handleLogout,
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      {profile &&
        <ProfileCard username={profile.username} fullName={profile.full_name} avatar={profile.avatar_url} email={profile.email}/>
      }

      <ProfileMenuSection title="Einstellungen" items={settings}/>
      <ProfileMenuSection title="Danger Zone" items={dangerZone}/>

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

      <DevelopmentNotice
        visible={devNoticeVisible}
        title={devNoticeContent.title}
        message={devNoticeContent.message}
        onClose={() => setDevNoticeVisible(false)}
      />
    </SafeAreaView>
  )
}

const createStyles = (theme : any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.text.primary,
    marginTop: 20,
  },

  topRow: {
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },

  username: {
    color: theme.text.primary,
    fontSize: 17,
    fontWeight: 600,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
})