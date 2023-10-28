import React from "react";
import { withSessionSsr } from "@/lib/withSession";

const PrivatePage = ({ user }) => (
  <div>
    <h1>Hello {user.email}</h1>
    <p>Secret Content</p>
  </div>
);

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user;

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: { user },
  };
});

export default PrivatePage;
