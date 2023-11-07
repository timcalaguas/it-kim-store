import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  HStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";

import { FcGoogle } from "react-icons/fc";
import { AiFillShop } from "react-icons/ai";
import AuthManager from "@/hooks/auth/AuthManager";
import { withSessionSsr } from "@/lib/withSession";

export default function SimpleCard() {
  const { loginWithGoogle } = AuthManager();

  return (
    <>
      <Head>
        <title>IT Kim - Vendor Login</title>
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
              <AiFillShop fontSize={"150px"} />
              <Stack align={"center"}>
                <Heading fontSize={"4xl"} textAlign={"center"}>
                  IT Kim - Vendor
                </Heading>
              </Stack>
              <Button
                color={"black"}
                leftIcon={<FcGoogle />}
                onClick={() => loginWithGoogle("vendor")}
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

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  if (user) {
    if (user.role === "customer") {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }
    if (user.role === "admin") {
      return {
        redirect: {
          permanent: false,
          destination: "/role/admin",
        },
      };
    }
    if (user.role === "courier") {
      return {
        redirect: {
          permanent: false,
          destination: "/role/courier",
        },
      };
    }
    if (user.role === "vendor") {
      return {
        redirect: {
          permanent: false,
          destination: "/role/vendor",
        },
      };
    }
  }

  return {
    props: { user },
  };
});
