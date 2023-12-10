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
  VStack,
  Box,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import Head from "next/head";
import { withSessionSsr } from "@/lib/withSession";
import AuthManager from "@/hooks/auth/AuthManager";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const { loginWithGoogle, signUpWithEmailAndPassword, isLoading } =
    AuthManager();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Head>
        <title>{"IT Kim - Sign up"}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading fontSize={"2xl"}>Sign up</Heading>
            <Heading fontSize={"3xl"} color={"primary.500"}>
              IT Kim - Sweet Delicacy Store
            </Heading>
            <VStack>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
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
                  signUpWithEmailAndPassword(name, email, password, "customer")
                }
                w={"100%"}
                variant={"primary"}
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </VStack>
            <HStack>
              <Divider /> <Text>or</Text> <Divider />
            </HStack>
            <Stack spacing={6}>
              <Button
                onClick={() => loginWithGoogle("customer")}
                leftIcon={<FcGoogle />}
              >
                Sign up with Google
              </Button>
            </Stack>
            <Box
              href={"/auth/login"}
              as={Link}
              textDecor={"underline"}
              marginInline={"auto"}
              color={"primary.500"}
            >
              Login?
            </Box>
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
