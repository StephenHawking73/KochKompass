import React, { useEffect } from "react";
import {
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";

const { height } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightFactor?: number;
  fullScreen?: boolean;
  initialHeight?: number;
};

export default function BasicBottomSheet({
  visible,
  onClose,
  children,
  heightFactor = 0.9,
  fullScreen = false,
  initialHeight = 370,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const topInset = insets.top;
  
  const sheetHeight = fullScreen 
                        ? height - topInset
                        : initialHeight;
  const maxSheetHeight = fullScreen 
                        ? height - topInset
                        : height * heightFactor;

  const currentHeight = useSharedValue(sheetHeight);
  const heightStyle = useAnimatedStyle(() => ({
    height: currentHeight.value,
  }));

  const translateY = useSharedValue(sheetHeight + 80);

  const styles = createStyles(theme, insets.bottom);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 240,
        mass: 0.85,
      });
    } else {
      translateY.value = withSpring(sheetHeight + 80, {
        damping: 28,
        stiffness: 260,
        mass: 0.9,
      });
    }
  }, [visible]);

  useEffect(() => {
    const show = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        currentHeight.value = withSpring(maxSheetHeight, {
          damping: 24,
          stiffness: 240,
        });
      }
    );

    const hide = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        currentHeight.value = withSpring(sheetHeight, {
          damping: 24,
          stiffness: 240,
        });
      }
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, [sheetHeight, maxSheetHeight]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        // Nach oben ziehen → Sheet vergrößern
        currentHeight.value = Math.min(
          sheetHeight - event.translationY * 0.5,
          maxSheetHeight
        );
      } else {
        // Nach unten ziehen → Sheet verschieben
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < 0) {
        currentHeight.value = withSpring(sheetHeight, {
          damping: 24,
          stiffness: 240,
        });

        translateY.value = withSpring(0, {
          damping: 24,
          stiffness: 240,
        });

        return;
      }


    const shouldClose =
      translateY.value > sheetHeight * 0.35 ||
      event.velocityY > 1200;


    if (shouldClose) {
      translateY.value = withSpring(sheetHeight + 80, {
        damping: 28,
        stiffness: 260,
      });

      runOnJS(onClose)();
    } else {
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 240,
      });
    }
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          backdropStyle,
        ]}
      >
        <BlurView
          intensity={18}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            heightStyle,
            sheetStyle,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.content}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={{flex: 1}}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const createStyles = (theme: any, bottomInset: number) =>
  StyleSheet.create({
    sheet: {
      position: "absolute",

      left: 0,
      right: 0,
      bottom: 0,

      backgroundColor: theme.card.background,

      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      overflow: "hidden",

      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(0,0,0,0.05)",

      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 25,
      shadowOffset: {
        width: 0,
        height: -8,
      },

      elevation: 30,
    },

    handle: {
      width: 42,
      height: 5,

      borderRadius: 999,

      backgroundColor: "#D7D7DC",

      alignSelf: "center",

      marginTop: 12,
      marginBottom: 18,
    },

    content: {
      flex: 1,

      paddingHorizontal: 24,
      paddingBottom: bottomInset,
    },
  });
