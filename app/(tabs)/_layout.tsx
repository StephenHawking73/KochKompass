import { TabButton } from "@/src/components/TabButton";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function AppLayout() {
    const session = true;
    return !session ? (
        <Redirect href={"./login"}/>
    ) : (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#29AEA7",
            tabBarInactiveTintColor: "black",
            //tabBarButton: HapticTab,
            animation: "fade",
        }}>
            <Tabs.Screen 
                name="index"
                options = {{
                    tabBarLabel: "Plan",
                    tabBarIcon: ({ color, size }) => <Ionicons name="calendar"  color={color} size={size}/>
                }}    
            />
            <Tabs.Screen 
                name="add_meal"
                options = {{
                   tabBarButton: TabButton,
                }}   
                listeners={() => ({
                    tabPress: (ev) => {
                        ev.preventDefault();
                    }
                })}
            />
            <Tabs.Screen 
                name="profile"
                options = {{
                    tabBarLabel: "Profil",
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size}/>,
                }}  
            />
        </Tabs>
    )
}