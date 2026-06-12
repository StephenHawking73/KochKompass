import React from 'react'
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
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