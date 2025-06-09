import { account } from "@/src/api/appwriteConfig";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView } from "react-native";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        init()
    }, []);

    const init = async () => {
        checkAuth();
    }

    const checkAuth = async () => {
        setLoading(true);
        try {
            const responseSession = await account.getSession('current');
            setSession(responseSession);

            const responseUser = await account.get();
            setUser(responseUser);
        } catch (err) {
            console.log(err);
            setSession(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async ({ email, password }) => {
        setLoading(true);
        try {
            const responseSession = await account.createEmailPasswordSession(email, password);
            setSession(responseSession);

            const responseUser = await account.get();
            setUser(responseUser);
        } catch (err) {
            Alert.alert("Da ist etwas schief gelaufen", err?.message || "Bitte versuche es später erneut.");
        } finally {
            setLoading(false);
        }
    }

    const signOut = async () => {
        setLoading(true);
        try {
            await account.deleteSession('current');
            setSession(null);
            setUser(null);
        } catch (err) {
            Alert.alert("Da ist etwas schief gelaufen", err?.message || "Bitte versuche es später erneut.");
        } finally {
            setLoading(false);
        }
    }

    const signUp = async ({ email, password, name }) => {
        setLoading(true);
        try {
            await account.create('unique()', email, password, name);
            await signIn({ email, password });
        } catch (err) {
            Alert.alert("Da ist etwas schief gelaufen", err?.message || "Bitte versuche es später erneut.");
        } finally {
            setLoading(false);
        }
    }

    const contextData = {session, user, signIn, signOut, signUp};
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

