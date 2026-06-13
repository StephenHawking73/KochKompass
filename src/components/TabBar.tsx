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
            color={isFocused ? theme.accent.primary: theme.text.op}
            label={label}
          />
        )

        /*return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole='button'
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {
              icons[route.name as RouteName]({
                color: isFocused ? theme.accent.primary : theme.text.op
              })
            }

            <Text style={{ color: isFocused ? theme.accent.primary : theme.text.op }}>
              {label}
            </Text>
          </TouchableOpacity>
        );*/
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
    backgroundColor: "white",
    marginHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 10,
    shadowOpacity: 0.1,
  }
})