// src/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Add color mode config
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const customTheme = extendTheme({
  config,
  // You can add custom colors for dark/light mode here
  colors: {
    brand: {
      500: "#718096", // gray.500
      600: "#4A5568", // gray.600
      700: "#2D3748", // gray.700
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
        color: props.colorMode === "dark" ? "white" : "black",
      },
    }),
  },
});

export default customTheme;