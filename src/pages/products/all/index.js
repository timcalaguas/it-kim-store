import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";

import { firestore } from "../../../../firebase-config";

import {
  Box,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { AiOutlineSearch } from "react-icons/ai";
import { useState, useEffect } from "react";

const Products = ({ productDocs }) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(productDocs);

  useEffect(() => {
    setProducts(productDocs);
    if (search != "") {
      const filteredProducts = products.filter((product) =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );

      setProducts(filteredProducts);
    }
  }, [search]);

  return (
    <>
      <Layout metaTitle={`IT Kim - Products`}>
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
            <HStack
              justifyContent={"space-between"}
              alignItems={"center"}
              flexWrap={"wrap"}
              gap={"12px"}
            >
              <Heading>Products </Heading>
              <InputGroup maxW={"320px"}>
                <InputLeftElement pointerEvents="none">
                  <AiOutlineSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Search Product"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </HStack>
            <ProductList products={products} />
          </Box>
        </Box>
      </Layout>
    </>
  );
};

export default Products;

export async function getServerSideProps(context) {
  const productsRef = firestore.collection("products");

  const response = await productsRef.get();
  const productDocs = !response.empty
    ? response.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];
  return {
    props: { productDocs },
  };
}
