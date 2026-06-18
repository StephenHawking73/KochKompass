import { AntDesign, FontAwesome6, Feather } from "@expo/vector-icons"

export const icons = {
    index: (props) => <AntDesign name="home" size={20} {...props} />,
    recipes: (props) => <FontAwesome6 name="book-open" size={20} {...props} />,
    profile: (props) => <AntDesign name="user" size={20} {...props} />,

    sun: (props) => <Feather name="sun" size={16} {...props} />,
    moon: (props) => <Feather name="moon" size={16} {...props} />
}