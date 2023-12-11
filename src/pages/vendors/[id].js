import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";
import getVendorsProducts from "@/hooks/products/getVendorProducts";

import { withSessionSsr } from "@/lib/withSession";
import { AiTwotoneMail, AiTwotoneHome, AiTwotonePhone } from "react-icons/ai";
import {
  Avatar,
  Box,
  Card,
  CardBody,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

const Vendor = ({ productDocs, user, vendor }) => {
  return (
    <Layout metaTitle={`IT Kim - ${vendor.storeName}`} user={user}>
      <Box
        minH={"100vh"}
        backgroundImage={"url('/wave.svg')"}
        backgroundRepeat={"no-repeat"}
        backgroundPosition={"bottom"}
      >
        <Box
          maxW={"1440px"}
          paddingInline={"32px"}
          marginInline={"auto"}
          paddingTop={"120px"}
        >
          <Card mb={"24px"}>
            <CardBody>
              <HStack gap={"24px"}>
                <Avatar src={vendor.storeLogo} boxSize={"150px"} />
                <Box>
                  <Text fontSize={"24px"} fontWeight={"600"}>
                    {vendor.storeName != "" ? vendor.storeName : vendor.name}
                  </Text>
                  <HStack>
                    <AiTwotoneMail />
                    <Text>{vendor.email}</Text>
                  </HStack>
                  <HStack>
                    <AiTwotoneHome />
                    <Text>
                      {vendor.addresses?.length > 0
                        ? `${vendor.addresses[0].address.no} ${vendor.addresses[0].address.street} ${vendor.addresses[0].address.barangay} ${vendor.addresses[0].address.city} 
${vendor.addresses[0].address.province}`                        : ""}
                    </Text>
                  </HStack>
                  <HStack>
                    <AiTwotonePhone />
                    <Text>{vendor.addresses[0].contactNumber}</Text>
                  </HStack>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Heading>Products </Heading>
          {productDocs.length > 0 ? (
            <ProductList products={productDocs} />
          ) : (
            <Box
              w={"100%"}
              height={"50vh"}
              display={"grid"}
              placeItems={"center"}
            >
              <Heading>No Products yet</Heading>
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default Vendor;

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const user = req.session.user ? req.session.user : null;

  const id = context.params.id;
  const { vendor, productDocs } = await getVendorsProducts(id);

  return {
    props: { productDocs, user, vendor },
  };
});
