import { useTheme } from "@/hooks/useTheme";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function FilterChip({
  label,
  selected,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
        onPress={onPress}
        style={[
            styles.chip,
            {
                backgroundColor: selected ? theme.accent.primary : theme.button.background,
            }
        ]}
    >
    <Text
        style={[
            styles.text,
            {
                color: selected ? theme.card.background : theme.text.primary,
            }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        height: 36,
    },
    text: {
        fontSize: 13.2,
        fontWeight: "500",
    }
})