export type ProfileType = {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    max_meat?: number | null;
    
    full_name?: string | null;
    bio?: string;
}