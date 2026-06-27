import { AntDesign, FontAwesome6, Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons"

export const icons = {
    index: (props) => <AntDesign name="home" size={20} {...props} />,
    recipes: (props) => <FontAwesome6 name="book-open" size={20} {...props} />,
    profile: (props) => <AntDesign name="user" size={20} {...props} />,

    sun: (props) => <Feather name="sun" size={16} {...props} />,
    moon: (props) => <Feather name="moon" size={16} {...props} />,

    search: (props) => <Feather name="search" size={18} {...props}/>,

    heart: (props) => <Feather name="heart" size={18} {...props}/>,
    heart_filled: (props) => <FontAwesome name="heart" size={18} {...props}/>,

    vegan: (props) => <Ionicons name="leaf" size={14} {...props}/>,
    vegetarian: (props) => <MaterialCommunityIcons name="food-apple-outline" size={14} {...props}/>,
    meat: (props) => <MaterialCommunityIcons name="food-drumstick-outline" size={14} {...props}/>,

    star: (props) => <AntDesign name="star" size={14} {...props}/>
}