import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";


type AuthContextType = {
    session: Session | null;
    loading: boolean;
    error: Error | null;
};


const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true,
    error: null,
});


export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


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
            (_event, session) => {

                setSession(session);

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}



export function useAuth() {
    return useContext(AuthContext);
}