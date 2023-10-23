import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import VendorCard from "./VendorCard";

const VendorList = ({ vendors }) => {
  console.log(vendors);
  return (
    <>
      <Box borderTopRadius={"50px"} w={"100%"}>
        <Box
          maxW={"1440px"}
          paddingInline={"32px"}
          paddingBlock={"56px"}
          marginInline={"auto"}
          bg={"primary.400"}
          borderRadius={"lg"}
        >
          <Heading fontSize="4xl" color={"white"} textAlign={"center"}>
            Our Vendors
          </Heading>
          <Text fontSize="lg" mt={2} color={"white"} textAlign={"center"}>
            We work with the best vendors to bring you quality sweets.
          </Text>
          <Flex
            gap={"32px"}
            mt={"32px"}
            flexWrap={"wrap"}
            justifyContent={"center"}
          >
            {vendors.length > 0 &&
              vendors.map((vendor, index) => (
                <VendorCard key={index} vendor={vendor} />
              ))}
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default VendorList;
