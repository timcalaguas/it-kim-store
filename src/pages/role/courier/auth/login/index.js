import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";

import { FcGoogle } from "react-icons/fc";
import { MdDeliveryDining } from "react-icons/md";
import AuthManager from "@/hooks/auth/AuthManager";
import Head from "next/head";

export default function SimpleCard() {
  const { loginWithGoogle } = AuthManager();

  return (
    <>
      <Head>
        <title>IT Kim - Courier Login</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack
          spacing={8}
          mx={"auto"}
          maxW={"1440px"}
          py={12}
          px={6}
          w={"100%"}
          display={"flex"}
          alignItems={"center"}
        >
          <Box
            w={"100%"}
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
            maxW={"520px"}
          >
            <Stack
              minH={"300px"}
              spacing={"12px"}
              width={"100%"}
              flexDirection={"column"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <MdDeliveryDining fontSize={"150px"} />
              <Stack align={"center"}>
                <Heading fontSize={"4xl"} textAlign={"center"}>
                  IT Kim - Courier
                </Heading>
              </Stack>
              <Button
                color={"black"}
                leftIcon={<FcGoogle />}
                onClick={() => loginWithGoogle("courier")}
              >
                Sign in with Google
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </>
  );
}
