import {heroui} from "@heroui/react";

export default heroui({
    layout: {
        radius: {
            small: "4px", // rounded-small
            medium: "6px", // rounded-medium
            large: "8px", // rounded-large
        },
        borderWidth: {
            small: "1px", // border-small
            medium: "1px", // border-medium
            large: "2px", // border-large
        },
    },
    themes: {
        light: {
            colors:{
                primary:{
                    50:  "#fdefff",
                    100: "#f8d6ff",
                    200: "#f3baff",
                    300: "#e88fff",
                    400: "#d963ff",
                    500: "#be28e5",
                    600: "#9c0fbd",
                    700: "#780a92",
                    800: "#530467",
                    900: "#360345",
                    DEFAULT: "#780a92",
                },
                secondary:{
                    50:  "#fafaf9",
                    100: "#f5f5f4",
                    200: "#e7e5e4",
                    300: "#d6d3d1",
                    400: "#a8a29e",
                    500: "#78716c",
                    600: "#57534e",
                    700: "#44403c",
                    800: "#292524",
                    900: "#1c1917",
                    DEFAULT: "#fafaf9"
                }
            }
        }
    }
})