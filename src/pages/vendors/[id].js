import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";
import getVendorsProducts from "@/hooks/products/getVendorProducts";

import { withSessionSsr } from "@/lib/withSession";

import { Box, Heading } from "@chakra-ui/react";

const Vendor = ({ productDocs, user, vendorName }) => {
  return (
    <Layout metaTitle={`IT Kim - ${vendorName}`} user={user}>
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
          <Heading>{vendorName}'s Products </Heading>
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
  const { vendorName, productDocs } = await getVendorsProducts(id);

  return {
    props: { productDocs, user, vendorName },
  };
});
