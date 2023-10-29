import VendorList from "@/components/VendorList";
import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";
import Layout from "@/components/Layout";

import { withSessionSsr } from "@/lib/withSession";
import getProducts from "@/hooks/getProducts";
import getUsers from "@/hooks/getUsers";

export default function Home({ products, vendors, user }) {
  return (
    <>
      <Layout metaTitle={"IT Kim"} user={user}>
        <Hero />
        <VendorList vendors={vendors} />
        <FeaturedProducts products={products} fromVendor={""} />
      </Layout>
    </>
  );
}

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  const products = await getProducts(3);
  const vendors = await getUsers("vendor");

  return {
    props: { products, vendors, user },
  };
});
