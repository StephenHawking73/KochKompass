import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
}



export default function Profile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true);
    
    // fetch Auth User
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.log("Auth error:", userError);
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    // Profile Table
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single()

    if (error) {
      console.log("Profile error:", error)
    } else {
      setProfile(data)
    }

    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {loading ? (
        <Text>Loading</Text>
      ) : profile ? (
        <View style={styles.topRow}>
          <Image 
            source={
              profile.avatar_url
              ? { uri: profile.avatar_url }
              : { uri: "https://avatar.imagik.app/_next/image?url=%2Fimages%2Favatar.webp&w=3840&q=75" }
            }
            style={styles.avatar}
          />

          <Text style={styles.username}>
            {profile.username}
          </Text>
        </View>
        ) : (
          <Text>Kein Profil gefunden</Text>
        )}
    </SafeAreaView>
  )
}

const createStyles = (theme : any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
    paddingHorizontal: 30,
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