import "@/styles/globals.css";

import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "../../theme.js";

export default function App({ Component, pageProps: { ...pageProps } }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
