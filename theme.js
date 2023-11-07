import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  components: {
    Button: {
      // Set the primary button style here
      baseStyle: {
        fontWeight: "regular",
        _hover: {
          // Define styles for the button on hover
          bg: "primary.400",
        },
      },
      // Define variants for different button types (e.g., primary, secondary, etc.)
      variants: {
        primary: {
          bg: "primary.400",
          color: "white",
          _hover: {
            bg: "primary.500",
            textDecoration: "none",
            _disabled: {
              bg: "primary.500",
            },
            _active: {
              bg: "primary.500",
            },
            _focused: {
              bg: "primary.500",
            },
          },
        },
        secondary: {
          bg: "secondary.400",
          color: "white",
          _hover: {
            bg: "secondary.500",
            textDecoration: "none",
            _disabled: {
              bg: "secondary.500",
            },
            _active: {
              bg: "primary.500",
            },
            _focused: {
              bg: "primary.500",
            },
          },
        },
      },
    },
  },
  colors: {
    // Define your primary color
    primary: {
      400: "#86673e", // Default color
      500: "#70532d", // Hover color
    },
    secondary: {
      400: "#DAA51F",
      500: "#b3871b",
    },
    tertiary: {
      400: "#F5E5D5",
    },
  },
});

export default customTheme;
