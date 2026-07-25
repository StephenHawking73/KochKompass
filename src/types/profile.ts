export type ProfileType = {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    
    family_name?: string;
    bio?: string;
}