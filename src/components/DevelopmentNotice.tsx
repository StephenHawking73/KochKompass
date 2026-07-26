import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import LottieView from "lottie-react-native";
import { useTheme } from "@/hooks/useTheme";
import { BlurView } from "expo-blur";
import { useThemeMode } from "@/hooks/useThemeMode";


type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
};


export default function DevelopmentNotice({
  visible,
  title = "Noch in Entwicklung",
  message = "Unser kleiner Koala arbeitet noch daran ...",
  onClose,
}: Props) {

  const theme = useTheme();
  const { isDark } = useThemeMode();
  const styles = createStyles(theme);


  const float = useSharedValue(0);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const translateY = useSharedValue(40);

  const [show, setShow] = useState(visible);

  useEffect(() => {

  if (visible) {
      setShow(true);

      opacity.value = withTiming(1, {
        duration: 250,
      });

      scale.value = withSpring(1, {
        damping: 14,
        stiffness: 180,
      });

      translateY.value = withSpring(0, {
        damping: 16,
        stiffness: 170,
      });

    } else {

      opacity.value = withTiming(0, {
        duration: 200,
      });

      scale.value = withTiming(0.85, {
        duration: 200,
      });

      translateY.value = withTiming(40, {
        duration: 200,
      });


      setTimeout(() => {
        setShow(false);
      }, 220);

    }

  }, [visible]);


  const animatedKoala = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: float.value * 10,
      },
    ],
  }));

  const animatedCard = useAnimatedStyle(() => ({
    opacity: opacity.value,

    transform: [
        {
        scale: scale.value,
        },
        {
        translateY: translateY.value,
        },
    ],
    
  }));

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));


  if (!show) {
    return null;
  }

  const close = () => {
    opacity.value = withTiming(0, {
      duration:200,
    });

    scale.value = withTiming(0.85, {
      duration:200,
    });

    translateY.value = withTiming(40, {
      duration:200,
    });


    setTimeout(() => {
      onClose?.();
    },220);
  };


  return (
    <Animated.View
      style={[
        styles.overlay,
        animatedOverlay,
      ]}
    >

      <BlurView
        intensity={35}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />


      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={close}
      />

      <Animated.View
        onStartShouldSetResponder={() => true}
        style={[
          styles.card,
          animatedCard,
          {backgroundColor: theme.card.background}
        ]}
      >

        <Animated.View style={animatedKoala}>

          <LottieView
            source={require("@/assets/animations/Sleeping Polar Bear.json")}
            autoPlay
            loop
            style={styles.animation}
          />

        </Animated.View>


        <Text style={styles.title}>
          {title}
        </Text>


        <Text style={styles.message}>
          {message}
        </Text>


        {onClose && (
          <Pressable
            onPress={onClose}
            style={({pressed}) => [
              styles.button,
              pressed && {
                opacity:0.8,
              }
            ]}
          >
            <Text style={styles.buttonText}>
              Verstanden
            </Text>
          </Pressable>
        )}

      </Animated.View>

    </Animated.View>
  );
}



const createStyles = (theme:any) =>
StyleSheet.create({
  overlay:{
    position:"absolute",

    left:0,
    right:0,
    top:0,
    bottom:0,

    justifyContent:"center",
    alignItems:"center",

    paddingHorizontal:25,
    },


  card:{
    width:"100%",

    borderRadius:28,

    paddingVertical:30,
    paddingHorizontal:24,

    alignItems:"center",

    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:18,

    shadowOffset:{
      width:0,
      height:6,
    },

    elevation:5,
  },


  animation:{
    width:150,
    height:150,
  },


  title:{
    marginTop:10,

    fontSize:24,
    fontWeight:"700",

    color:theme.text.primary,

    textAlign:"center",
  },


  message:{
    marginTop:12,

    fontSize:15,
    lineHeight:22,

    color:theme.text.op,

    textAlign:"center",

    paddingHorizontal:15,
  },


  button:{
    marginTop:25,

    height:52,

    paddingHorizontal:35,

    borderRadius:18,

    justifyContent:"center",
    alignItems:"center",

    backgroundColor:theme.accent.primary,
  },


  buttonText:{
    color:"#fff",

    fontSize:16,

    fontWeight:"700",
  },

});