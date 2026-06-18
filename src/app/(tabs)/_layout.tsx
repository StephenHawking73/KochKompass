import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/TabBar'

export default function TabLayout() {
  return (
    <Tabs
        tabBar={(props: any) => <TabBar {...props} />}
    >
        <Tabs.Screen
            name = "index"
            options={{
                headerShown: false,
                title: "Home",
            }}    
        />
        <Tabs.Screen
            name = "recipes"
            options={{
                headerShown: false,
                title: "Rezepte",
            }}    
        />
        <Tabs.Screen
            name = "profile"
            options={{
                headerShown: false,
                title: "Profil",
            }}    
        />
    </Tabs>
  )
}