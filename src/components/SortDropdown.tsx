import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { SortOption } from "@/types/recipeFilters";
import { icons } from "@/assets/icons";

type Option = {
  label: string;
  value: SortOption;
};

type Props = {
  value: SortOption;
  options: Option[];
  onChange: (value: SortOption) => void;
};

export default function SortDropdown({
  value,
  options,
  onChange,
}: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [open, setOpen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-8));

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? "Sortieren";

  const openMenu = () => {
    setOpen(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -8,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setOpen(false));
  };

  return (
    <View style={styles.wrapper}>
      {/* Trigger */}
      <Pressable style={styles.button} onPress={openMenu}>
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>{selectedLabel}</Text>

          <Animated.View
            style={{
              transform: [
                {
                  rotate: open ? "180deg" : "0deg",
                },
              ],
            }}
          >
            {icons.down({
              color: theme.text.primary,
            })}
          </Animated.View>
        </View>
      </Pressable>

      {/* Overlay */}
      <Modal transparent visible={open} animationType="none">
        <Pressable style={styles.backdrop} onPress={closeMenu} />

        <View style={styles.modalContainer}>
            <Animated.View
            style={[
                styles.dropdown,
                {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                },
            ]}
            >
            {options.map((option) => {
                const active = option.value === value;

                return (
                <Pressable
                    key={option.value}
                    onPress={() => {
                    onChange(option.value);
                    closeMenu();
                    }}
                    style={[styles.option, active && styles.activeOption]}
                >
                    <Text
                    style={[
                        styles.optionText,
                        active && styles.activeText,
                    ]}
                    >
                    {option.label}
                    </Text>
                </Pressable>
                );
            })}
            </Animated.View>
        </View>
        </Modal>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: {
      alignItems: "flex-end",
    },

    button: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },

    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    buttonText: {
      color: theme.text.primary,
      fontWeight: "600",
    },

    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    dropdown: {
      backgroundColor: theme.card.background,
      borderRadius: 12,
      padding: 6,

      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },

    option: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
    },

    activeOption: {
      backgroundColor: theme.accent.primary + "20",
    },

    optionText: {
      color: theme.text.primary,
    },

    activeText: {
      fontWeight: "700",
    },

    modalContainer: {
        flex: 1,
        alignItems: "flex-end",
        paddingRight: 20,
        paddingTop: 120,
    },
  });