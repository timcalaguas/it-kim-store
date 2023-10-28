import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";

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

import getAllProducts from "@/hooks/products/getAllProducts";
import { withSessionSsr } from "@/lib/withSession";

const Products = ({ productDocs, user }) => {
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
      <Layout metaTitle={`IT Kim - Products`} user={user}>
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

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const user = req.session.user ? req.session.user : null;

  const productDocs = await getAllProducts();

  return {
    props: { productDocs, user },
  };
});
