import { Box, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <>
      <Box bgColor="#F5E5D5" color="black" p={4}>
        <Box
          textAlign={"center"}
          display={"grid"}
          placeItems={"center"}
          maxWidth={"1440px"}
          marginInline={"auto"}
        >
          <Text>
            © 2023 - IT Kim - Special Kapampangan Sweet Delicacy Store
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default Footer;
