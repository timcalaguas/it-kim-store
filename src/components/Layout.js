import Footer from "./Footer";
import Navbar from "./Navbar";
import Head from "next/head";

const Layout = ({ metaTitle, user, children }) => {
  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar user={user} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
