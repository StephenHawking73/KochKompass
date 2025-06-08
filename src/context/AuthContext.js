import { createContext, useContext, useState } from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(false);
    const [user, setUser] = useState(false);

    const signIn = async () => {

    }

    const signOut = async () => {

    }

    const contextData = {session, user, signIn, signOut};
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator color={"#29AEA7"} size="large"/>
                </SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

const useAuth = () => {return useContext(AuthContext);}

export { AuthContext, AuthProvider, useAuth };

