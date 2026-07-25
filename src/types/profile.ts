export type ProfileType = {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    
    full_name?: string | null;
    bio?: string;
}