import VendorList from "@/components/VendorList";
import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";
import Layout from "@/components/Layout";

import { getSession } from "next-auth/react";
import getProducts from "@/hooks/getProducts";
import getVendors from "@/hooks/getVendors";

export default function Home({ products, vendors }) {
  return (
    <>
      <Layout metaTitle={"IT Kim"}>
        <Hero />
        <VendorList vendors={vendors} />
        <FeaturedProducts products={products} fromVendor={""} />
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  const products = await getProducts(3);
  const vendors = await getVendors();

  return {
    props: { products, vendors },
  };
}
