import {
  Button,
  Checkbox,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Image,
  HStack,
  Divider,
  Link,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import Head from "next/head";

import AuthManager from "@/hooks/auth/AuthManager";

export default function Login() {
  const { loginWithGoogle } = AuthManager();
  return (
    <>
      <Head>
        <title>{"IT Kim - Login"}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading fontSize={"2xl"}>Sign in</Heading>
            <Heading fontSize={"3xl"} color={"primary.500"}>
              IT Kim - Sweet Delicacy Store
            </Heading>

            <Stack spacing={6}>
              <Button
                onClick={() => loginWithGoogle("customer")}
                leftIcon={<FcGoogle />}
              >
                Sign in with Google
              </Button>
            </Stack>
          </Stack>
        </Flex>
        <Flex flex={1}>
          <Image
            alt={"Login Image"}
            objectFit={"cover"}
            src={
              "https://images.pexels.com/photos/12394060/pexels-photo-12394060.jpeg?auto=compress&cs=tinysrgb&w=1600"
            }
          />
        </Flex>
      </Stack>
    </>
  );
}
