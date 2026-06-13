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
            name = "ratings"
            options={{
                headerShown: false,
                title: "Bewertungen",
            }}    
        />
        <Tabs.Screen
            name = "profile"
            options={{
                headerShown: false,
                title: "Profile",
            }}    
        />
    </Tabs>
  )
}