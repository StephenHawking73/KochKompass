import { AntDesign, FontAwesome6, Feather, Ionicons, MaterialCommunityIcons, FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons"

export const icons = {
    index: (props) => <AntDesign name="home" size={20} {...props} />,
    recipes: (props) => <FontAwesome6 name="book-open" size={20} {...props} />,
    profile: (props) => <AntDesign name="user" size={20} {...props} />,

    sun: (props) => <Feather name="sun" size={16} {...props} />,
    moon: (props) => <Feather name="moon" size={16} {...props} />,

    search: (props) => <Feather name="search" size={18} {...props}/>,

    heart: (props) => <Feather name="heart" size={16} {...props}/>,
    heart_filled: (props) => <FontAwesome name="heart" size={16} {...props}/>,

    vegan: (props) => <Ionicons name="leaf" size={16} {...props}/>,
    vegetarian: (props) => <MaterialCommunityIcons name="food-apple-outline" size={16} {...props}/>,
    meat: (props) => <MaterialCommunityIcons name="food-drumstick-outline" size={16} {...props}/>,

    time: (props) => <MaterialIcons name="access-time" size={16} {...props}/>,
    hat: (props) => <MaterialCommunityIcons name="chef-hat" size={16} {...props}/>,

    star: (props) => <FontAwesome name="star" size={14} {...props}/>,
    star_half: (props) => <FontAwesome name="star-half" size={14} {...props}/>,
    star_o: (props) => <FontAwesome name="star-o" size={14} {...props}/>,


    down: (props) => <FontAwesome6 name="chevron-down" size={14} {...props}/>,
    up: (props) => <FontAwesome6 name="chevron-up" size={14} {...props}/>,
    back: (props) => <FontAwesome6 name="chevron-left" size={19} {...props}/>,
    right: (props) => <FontAwesome6 name="chevron-right" size={19} {...props}/>,
    close: (props) => <AntDesign name="close" size={19} {...props}/>,

    more: (props) => <AntDesign name="more" size={19} {...props}/>,

    link: (props) => <Entypo name="link" size={20} {...props}/>,
}