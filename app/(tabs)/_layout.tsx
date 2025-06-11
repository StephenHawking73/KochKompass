import { TabButton } from "@/src/components/TabButton";
import { useAuth } from "@/src/context/AuthContext";
import { ModalProvider } from "@/src/context/ModalContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AddMeal from "./add_meal";

export default function AppLayout() {
    const {session} = useAuth();
    return (
        !session ? (
            <Redirect href={"./login"}/>
        ) : (
            <GestureHandlerRootView>
                <ModalProvider>
                    <Tabs screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: "#29AEA7",
                        tabBarInactiveTintColor: "black",
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

                    <AddMeal/>
                </ModalProvider>
            </GestureHandlerRootView>
            
        )
    )
}