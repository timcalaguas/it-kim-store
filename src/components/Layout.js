import Footer from "./Footer";
import Navbar from "./Navbar";
import Head from "next/head";
import { Box, Heading, Button } from "@chakra-ui/react";
import { BiSolidError } from "react-icons/bi";
import AuthManager from "@/hooks/auth/AuthManager";

const Layout = ({ metaTitle, user, children }) => {
  const { logout } = AuthManager();

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar user={user} />
      {(user != null && user.status != "blocked") || user == null ? (
        <main>{children}</main>
      ) : (
        <Box
          width={"100%"}
          height={"100vh"}
          display={"grid"}
          p={"16px"}
          placeItems={"center"}
        >
          <Box
            maxW={"720px"}
            textAlign={"center"}
            padding={"24px"}
            border={"1px"}
            borderColor={"gray.300"}
            borderRadius={"16px"}
            minH={"250px"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={"24px"}
            bg={"white"}
          >
            <BiSolidError fontSize={"50px"} fill="red" />
            <Heading fontSize={"2xl"}>
              Your account has been suspended due to non-compliance with our
              regulations. For more information or to appeal, please contact our
              support team.
            </Heading>
            <Button onClick={() => logout("customer")}>Sign out</Button>
          </Box>
        </Box>
      )}
      <Footer />
    </>
  );
};

export default Layout;
