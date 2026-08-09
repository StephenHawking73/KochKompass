import { icons } from "@/assets/icons";
import type React from "react";

export type GroupIconName =
    | "users"
    | "home"
    | "chef"
    | "plate"
    | "leaf"
    | "calendar";

type IconProps = {
    color?: string;
    size?: number;
};

type GroupIconOption = {
    name: GroupIconName;
    label: string;
    render: (props: IconProps) => React.ReactNode;
};

export const GROUP_ICON_OPTIONS: GroupIconOption[] = [
    { name: "users", label: "Team", render: icons.groupUsers },
    { name: "home", label: "Zuhause", render: icons.groupHome },
    { name: "chef", label: "Kochen", render: icons.groupChef },
    { name: "plate", label: "Essen", render: icons.groupPlate },
    { name: "leaf", label: "Frisch", render: icons.groupLeaf },
    { name: "calendar", label: "Plan", render: icons.groupCalendar },
];

export const GROUP_ACCENT_OPTIONS = [
    "#82C05C",
    "#3C49C2",
    "#F59E0B",
    "#008B8B",
    "#D946EF",
    "#EF4444",
];

export function normalizeGroupIcon(icon?: string | null): GroupIconName {
    return GROUP_ICON_OPTIONS.some((option) => option.name === icon)
        ? icon as GroupIconName
        : "users";
}

export function renderGroupIcon(icon: string | null | undefined, props: IconProps) {
    const normalizedIcon = normalizeGroupIcon(icon);
    const option = GROUP_ICON_OPTIONS.find((item) => item.name === normalizedIcon) ?? GROUP_ICON_OPTIONS[0];

    return option.render(props);
}

export function hexToRgba(hex: string | null | undefined, alpha: number) {
    const fallback = { red: 130, green: 192, blue: 92 };
    const normalizedHex = String(hex ?? "").replace("#", "");
    const isValidHex = /^[0-9a-fA-F]{6}$/.test(normalizedHex);

    if (!isValidHex) {
        return `rgba(${fallback.red}, ${fallback.green}, ${fallback.blue}, ${alpha})`;
    }

    const red = parseInt(normalizedHex.slice(0, 2), 16);
    const green = parseInt(normalizedHex.slice(2, 4), 16);
    const blue = parseInt(normalizedHex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
