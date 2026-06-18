import { AntDesign, FontAwesome } from "@expo/vector-icons"

export const icons = {
    index: (props) => <AntDesign name="home" size={20} {...props} />,
    recipes: (props) => <FontAwesome name="star" size={20} {...props} />,
    profile: (props) => <AntDesign name="user" size={20} {...props} />
}