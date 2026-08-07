import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { getActiveGroupContext } from "@/services/groupService";


type AuthContextType = {
    session: Session | null;
    loading: boolean;
    error: Error | null;
    activeGroupId: string | null;
    userId: string | null;
    refreshActiveGroup: () => Promise<void>;
};


const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true,
    error: null,
    activeGroupId: null,
    userId: null,
    refreshActiveGroup: async () => undefined,
});


export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const refreshActiveGroup = async () => {
        try {
            const context = await getActiveGroupContext();
            setActiveGroupId(context.activeGroupId);
            setUserId(context.userId);
        } catch {
            setActiveGroupId(null);
            setUserId(null);
        }
    };


    useEffect(() => {

        async function loadSession() {

            try {

                const {
                    data,
                    error,
                } = await supabase.auth.getSession();


                if (error) {
                    throw error;
                }


                setSession(data.session);

                if (data.session?.user) {
                    await refreshActiveGroup();
                } else {
                    setUserId(null);
                    setActiveGroupId(null);
                }

            } catch (err) {

                setError(err as Error);

            } finally {

                setLoading(false);

            }
        }


        loadSession();


        const {
            data: listener,
        } = supabase.auth.onAuthStateChange(
            async (_event, session) => {

                setSession(session);

                if (session?.user) {
                    await refreshActiveGroup();
                } else {
                    setUserId(null);
                    setActiveGroupId(null);
                }

            }
        );


        return () => {
            listener.subscription.unsubscribe();
        };


    }, []);



    return (
        <AuthContext.Provider
            value={{
                session,
                loading,
                error,
                activeGroupId,
                userId,
                refreshActiveGroup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}



export function useAuth() {
    return useContext(AuthContext);
}