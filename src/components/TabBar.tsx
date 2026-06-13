import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { JSX } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import TabBarButton from './TabBarButton';

type TabBarProps = {
  state: any
  descriptors: any
  navigation: any
}

export default function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        if(['_sitemap', '+not-found'].includes(route.name)) return null;
        
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? theme.accent.primary: theme.tabBar.text}
            label={label}
          />
        )

      })}
    </View>
  )
}

const createStyles = (theme: any) => StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: theme.tabBar.background,

    marginHorizontal: 50,
    paddingVertical: 15,

    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.tabBar.border,

    shadowColor: theme.tabBar.shadow,
    shadowOffset: {width: 0, height: 12},
    shadowRadius: 18,
    shadowOpacity: 1,

    elevation: 12,
  }
})