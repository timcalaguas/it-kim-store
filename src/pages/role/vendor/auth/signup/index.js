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
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";

import { FcGoogle } from "react-icons/fc";
import { AiFillShop } from "react-icons/ai";
import AuthManager from "@/hooks/auth/AuthManager";
import { withSessionSsr } from "@/lib/withSession";
import { useState } from "react";
import Link from "next/link";

export default function SimpleCard() {
  const { loginWithGoogle, signUpWithEmailAndPassword, isLoading } =
    AuthManager();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Head>
        <title>IT Kim - Vendor Sign Up</title>
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
              <Heading fontSize={"xl"} textAlign={"center"}>
                SIGN UP
              </Heading>
              <Stack align={"center"}>
                <Heading fontSize={"4xl"} textAlign={"center"}>
                  IT Kim - Vendor
                </Heading>
              </Stack>
              <VStack width={"100%"}>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button
                  onClick={() =>
                    signUpWithEmailAndPassword(email, password, "vendor")
                  }
                  w={"100%"}
                  colorScheme={"blue"}
                  isLoading={isLoading}
                >
                  Sign up
                </Button>
              </VStack>
              <HStack>
                <Divider /> <Text>or</Text> <Divider />
              </HStack>
              <Button
                color={"black"}
                leftIcon={<FcGoogle />}
                onClick={() => loginWithGoogle("vendor")}
              >
                Sign up with Google
              </Button>
              <Box
                href={"/role/vendor/auth/login"}
                as={Link}
                textDecor={"underline"}
                marginInline={"auto"}
                color={"primary.500"}
              >
                Login?
              </Box>
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
