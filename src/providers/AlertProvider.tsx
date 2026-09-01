import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BasicBottomSheet from "@/components/BasicBottomSheet";
import { useTheme } from "@/hooks/useTheme";

export type AppAlertAction = {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "primary" | "cancel" | "destructive";
};

export type AppAlertConfig = {
  title: string;
  message?: string;
  actions?: AppAlertAction[];
};

type AlertContextValue = {
  showAlert: (config: AppAlertConfig) => void;
  dismissAlert: () => void;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

function AlertSheet({
  visible,
  config,
  onClose,
}: {
  visible: boolean;
  config: AppAlertConfig | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!config) {
    return null;
  }

  const actions = config.actions?.length
    ? config.actions
    : [{ text: "OK", style: "primary" as const }];

  const handleAction = (action: AppAlertAction) => {
    if (action.onPress) {
      action.onPress();
    }
    onClose();
  };

  const baseHeight = config.message ? 340 : 180;

  return (
    <BasicBottomSheet visible={visible} onClose={onClose} initialHeight={baseHeight}>
      <View style={styles.sheetContent}>
        <Text style={styles.title}>{config.title}</Text>

        {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

        <View style={styles.actionsRow}>
          {actions.map((action) => {
            const isDestructive = action.style === "destructive";
            const isCancel = action.style === "cancel";
            const isPrimary = action.style === "primary" || (!action.style && !isDestructive && !isCancel);

            return (
              <Pressable
                key={`${action.text}-${action.style ?? "default"}`}
                onPress={() => handleAction(action)}
                style={({ pressed }) => [
                  styles.actionButton,
                  isPrimary && styles.primaryButton,
                  isDestructive && styles.destructiveButton,
                  isCancel && styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    isPrimary && styles.primaryText,
                    isDestructive && styles.destructiveText,
                    isCancel && styles.cancelText,
                  ]}
                >
                  {action.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </BasicBottomSheet>
  );
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AppAlertConfig | null>(null);

  const dismissAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setConfig(null), 200);
  }, []);

  const showAlert = useCallback((nextConfig: AppAlertConfig) => {
    setConfig(nextConfig);
    setVisible(true);
  }, []);

  const value = useMemo<AlertContextValue>(
    () => ({
      showAlert,
      dismissAlert,
    }),
    [dismissAlert, showAlert]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertSheet visible={visible} config={config} onClose={dismissAlert} />
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAppAlert must be used within an AlertProvider");
  }

  return context;
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 4,
      gap: 18,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text.primary,
      textAlign: "center",
    },
    message: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text.op,
      textAlign: "center",
      paddingHorizontal: 12,
    },
    actionsRow: {
      gap: 10,
    },
    actionButton: {
      minHeight: 52,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    primaryButton: {
      backgroundColor: theme.accent.primary,
    },
    destructiveButton: {
      backgroundColor: "rgba(255, 77, 77, 0.08)",
      borderColor: "rgba(255, 77, 77, 0.2)",
    },
    cancelButton: {
      backgroundColor: theme.button.background,
      borderColor: theme.button.border,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    actionText: {
      fontSize: 16,
      fontWeight: "700",
    },
    primaryText: {
      color: "#ffffff",
    },
    destructiveText: {
      color: theme.notification,
    },
    cancelText: {
      color: theme.text.primary,
    },
  });
