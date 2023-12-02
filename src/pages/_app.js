import "@/styles/globals.css";

import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "../../theme.js";
import { DateCheckerProvider } from "@/hooks/context/DateCheckerContext.js";

export default function App({ Component, pageProps: { ...pageProps } }) {
  return (
    <ChakraProvider theme={customTheme}>
      <DateCheckerProvider>
        <Component {...pageProps} />
      </DateCheckerProvider>
    </ChakraProvider>
  );
}
