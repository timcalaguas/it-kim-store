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
import Head from "next/head";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SignUp() {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>{"IT Kim - SignUp"}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading fontSize={"2xl"}>
              Sign up {session?.user?.email} {session?.user?.role}{" "}
            </Heading>
            <Heading fontSize={"3xl"}>IT Kim - Sweet Delicacy Store</Heading>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" />
            </FormControl>

            <Stack spacing={6}>
              <Button variant={"primary"} onClick={() => signIn("google")}>
                Sign in
              </Button>
            </Stack>
            <HStack justifyContent={"center"}>
              <Text>Don't have an account?</Text>
              <Link color={"blue"} onClick={() => signOut()}>
                Sign up
              </Link>
            </HStack>
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
