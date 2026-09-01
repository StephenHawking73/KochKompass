import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { icons } from '@/assets/icons';
import { useAppAlert } from '@/providers/AlertProvider';
import {
  changePassword,
  getProfile,
  removeAvatarImage,
  updateProfileDetails,
  updateProfileEmail,
  uploadAvatarImage,
} from '@/services/profileService';

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

export default function ProfileEdit() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { showAlert } = useAppAlert();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', full_name: '' });
  const [emailInput, setEmailInput] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setProfileForm({
          username: data?.username ?? '',
          full_name: data?.full_name ?? '',
        });
        setEmailInput(data?.email ?? '');
      } catch {
        setError('Dein Profil konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const saveProfileChanges = async () => {
    if (!profile) {
      return;
    }

    const trimmedUsername = profileForm.username.trim();
    const trimmedFullName = profileForm.full_name.trim();
    const trimmedEmail = emailInput.trim();

    setError('');
    setSuccess('');

    if (!trimmedUsername) {
      setError('Bitte gib einen Namen ein.');
      return;
    }

    const hasProfileChanges =
      trimmedUsername !== profile.username ||
      trimmedFullName !== (profile.full_name ?? '');

    const hasEmailChanges = trimmedEmail.toLowerCase() !== (profile.email ?? '').toLowerCase();

    if (!hasProfileChanges && !hasEmailChanges) {
      setError('Es gibt keine Änderungen zum Speichern.');
      return;
    }

    setSavingProfile(true);

    try {
      if (hasProfileChanges) {
        const updatedProfile = await updateProfileDetails({
          username: trimmedUsername,
          full_name: trimmedFullName,
        });
        setProfile((current: any) => (current ? { ...current, ...updatedProfile } : updatedProfile));
      }

      if (hasEmailChanges) {
        const result = await updateProfileEmail(trimmedEmail);
        setProfile((current: any) => (current ? { ...current, email: result.email } : current));
      }

      setSuccess('Änderungen gespeichert. Bei einer E-Mail-Änderung wird eine Bestätigung an die neue Adresse gesendet.');
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Die Änderungen konnten nicht gespeichert werden.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setError('');
    setSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Bitte fülle alle Passwortfelder aus.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Dein Passwort wurde erfolgreich geändert.');
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Das Passwort konnte nicht geändert werden.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Bitte erlaube den Zugriff auf deine Fotos, damit du ein Profilbild auswählen kannst.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setError(`Das Bild darf maximal ${MAX_AVATAR_SIZE_MB} MB groß sein.`);
      return;
    }

    setUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const uploadedUrl = await uploadAvatarImage(asset.uri);
      setProfile((current: any) => (current ? { ...current, avatar_url: uploadedUrl } : current));
      setSuccess('Dein Profilbild wurde hochgeladen.');
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Das Profilbild konnte nicht hochgeladen werden.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) {
      return;
    }

    showAlert({
      title: 'Profilbild entfernen',
      message: 'Möchtest du dein Profilbild wirklich löschen?',
      actions: [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            setDeletingAvatar(true);
            setError('');
            setSuccess('');

            try {
              await removeAvatarImage();
              setProfile((current: any) => (current ? { ...current, avatar_url: null } : current));
              setSuccess('Dein Profilbild wurde gelöscht.');
            } catch (err: unknown) {
              setError(getFriendlyErrorMessage(err, 'Das Profilbild konnte nicht gelöscht werden.'));
            } finally {
              setDeletingAvatar(false);
            }
          },
        },
      ],
    });
  };

  const initials = useMemo(() => {
    const source = (profile?.full_name || profile?.username || 'K').trim();
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('') || 'K';
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Profil wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary, size: 20 })}
          </Pressable>

          <Text style={styles.headerTitle}>Profil bearbeiten</Text>

          <Pressable
            style={[styles.saveHeaderButton, savingProfile && styles.saveHeaderButtonDisabled]}
            onPress={saveProfileChanges}
            disabled={savingProfile}
          >
            <Text style={styles.saveHeaderButtonText}>{savingProfile ? 'Speichern...' : 'Speichern'}</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Avatar</Text>

            <View style={styles.avatarSection}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{initials}</Text>
                </View>
              )}

              <View style={styles.avatarActions}>
                <Pressable
                  style={[styles.primaryButton, uploadingAvatar && styles.buttonDisabled]}
                  onPress={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  <Text style={styles.primaryButtonText}>{uploadingAvatar ? 'Hochladen...' : 'Bild ändern'}</Text>
                </Pressable>

                <Pressable
                  style={[styles.secondaryButton, deletingAvatar && styles.buttonDisabled]}
                  onPress={handleAvatarDelete}
                  disabled={!profile?.avatar_url || deletingAvatar}
                >
                  <Text style={styles.secondaryButtonText}>{deletingAvatar ? 'Entfernen...' : 'Entfernen'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Persönliche Informationen</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Name / Anzeigename</Text>
              <TextInput
                value={profileForm.username}
                onChangeText={(value) => setProfileForm((current) => ({ ...current, username: value }))}
                placeholder="Dein Name"
                placeholderTextColor={theme.text.op}
                style={styles.input}
                autoCapitalize="words"
                editable={!savingProfile}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Vollständiger Name</Text>
              <TextInput
                value={profileForm.full_name}
                onChangeText={(value) => setProfileForm((current) => ({ ...current, full_name: value }))}
                placeholder="Optional"
                placeholderTextColor={theme.text.op}
                style={styles.input}
                autoCapitalize="words"
                editable={!savingProfile}
              />
            </View>

            {/*<View style={styles.fieldGroup}>
              <Text style={styles.label}>E-Mail-Adresse</Text>
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="deine@email.de"
                placeholderTextColor={theme.text.op}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!savingProfile}
              />
            </View>*/}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Passwort ändern</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Aktuelles Passwort</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={passwordForm.currentPassword}
                  onChangeText={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                  placeholder="Aktuelles Passwort"
                  placeholderTextColor={theme.text.op}
                  secureTextEntry={!showCurrentPassword}
                  style={[styles.input, styles.passwordInput]}
                  autoCapitalize="none"
                  editable={!savingPassword}
                />
                <Pressable onPress={() => setShowCurrentPassword((value) => !value)} style={styles.eyeButton}>
                  {showCurrentPassword ? icons.eyeOff({ color: theme.text.op, size: 18 }) : icons.eye({ color: theme.text.op, size: 18 })}
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Neues Passwort</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={passwordForm.newPassword}
                  onChangeText={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                  placeholder="Neues Passwort"
                  placeholderTextColor={theme.text.op}
                  secureTextEntry={!showNewPassword}
                  style={[styles.input, styles.passwordInput]}
                  autoCapitalize="none"
                  editable={!savingPassword}
                />
                <Pressable onPress={() => setShowNewPassword((value) => !value)} style={styles.eyeButton}>
                  {showNewPassword ? icons.eyeOff({ color: theme.text.op, size: 18 }) : icons.eye({ color: theme.text.op, size: 18 })}
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Neues Passwort bestätigen</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                  placeholder="Passwort bestätigen"
                  placeholderTextColor={theme.text.op}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, styles.passwordInput]}
                  autoCapitalize="none"
                  editable={!savingPassword}
                />
                <Pressable onPress={() => setShowConfirmPassword((value) => !value)} style={styles.eyeButton}>
                  {showConfirmPassword ? icons.eyeOff({ color: theme.text.op, size: 18 }) : icons.eye({ color: theme.text.op, size: 18 })}
                </Pressable>
              </View>
            </View>

            <Text style={styles.passwordHint}>Mindestens 8 Zeichen. Für bessere Sicherheit: Groß-/Kleinschreibung, Zahl und Sonderzeichen.</Text>

            <Pressable
              style={[styles.primaryButton, savingPassword && styles.buttonDisabled]}
              onPress={handlePasswordUpdate}
              disabled={savingPassword}
            >
              <Text style={styles.primaryButtonText}>{savingPassword ? 'Passwort wird geändert...' : 'Passwort ändern'}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.tabBar.border ?? '#E5E5E5',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.card.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  saveHeaderButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  saveHeaderButtonDisabled: {
    opacity: 0.7,
  },
  saveHeaderButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
    gap: 18,
  },
  sectionCard: {
    backgroundColor: theme.card.background,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  avatarActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.accent.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? '#E5E5E5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 12,
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
    color: theme.text.op,
    fontSize: 12,
    lineHeight: 18,
  },
  passwordHint: {
    color: theme.text.op,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  errorText: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
