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

export default function Profile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {isDark} = useThemeMode();

  const [profile, setProfile] = useState<ProfileType | null>(null);

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

  const settings = [
    {
      title: "Design",
      subtitle: isDark ? "Dunkel" : "Hell",
      icon: isDark ? icons.moon({color: theme.text.primary, size: 20}): icons.sun({color: theme.text.primary, size: 20}),
      onPress: () => {}
    },
    {
      title: "Sprache",
      icon: icons.globe({color: theme.text.primary, size: 20}),
      onPress: () => {}
    },
    {
      title: "Benachrichtigungen",
      icon: icons.bell({color: theme.text.primary, size: 20}),

    }
  ]

  const dangerZone = [
    {
      title: "Ausloggen",
      icon: icons.exit({color: theme.notification, size: 20}),
      onPress: handleLogout,
    }
  ]

  console.log(profile)

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      {profile &&
        <ProfileCard username={profile.username} fullName={profile.full_name} avatar={profile.avatar_url} email={profile.email}/>
      }

      <ProfileMenuSection title="Einstellungen" items={settings}/>
      <ProfileMenuSection title="Danger Zone" items={dangerZone}/>
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
})