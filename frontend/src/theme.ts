// src/theme.ts
import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    primary: "#2b6cb0",
    secondary: "#ff9800",
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Verdana, sans-serif",
  },
});

export default customTheme;