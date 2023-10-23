import Layout from "@/components/Layout";
import { firestore } from "../../../firebase-config";
import { Box, Heading } from "@chakra-ui/react";
import ProductList from "@/components/ProductList";
const Vendor = ({ productDocs }) => {
  const vendorName = productDocs.length > 0 ? productDocs[0].vendor : "";

  return (
    <>
      <Layout metaTitle={`IT Kim - ${vendorName}`}>
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
            <ProductList products={productDocs} />
          </Box>
        </Box>
      </Layout>
    </>
  );
};

export default Vendor;

export async function getServerSideProps(context) {
  const id = context.params.id;
  const productsRef = firestore.collection("products");

  const response = await productsRef.where("vendorUID", "==", id).get();
  console.log(response.empty);
  const productDocs = !response.empty
    ? response.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];
  console.log(productDocs);
  return {
    props: { productDocs },
  };
}
