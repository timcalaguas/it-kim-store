import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { firestore } from "../../../../firebase-config";

export default async function auth(req, res) {
  return await NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    jwt: {
      maxAge: 60 * 60 * 24 * 30,
    },
    callbacks: {
      async jwt({ token, user, account, profile, isNewUser }) {
        return token;
      },
      async session(session) {
        console.log(session);
        const parsedUrl = new URL(req.cookies["next-auth.callback-url"]);
        const path = parsedUrl.pathname;
        const role = getRoleFromPath(path);

        if (session) {
          const userDocRef = firestore
            .collection("users")
            .where("email", "==", session.session.user.email)
            .limit(1);

          const userDoc = await userDocRef.get();

          if (userDoc.empty) {
            const newUserInfo = {
              email: session.session.user.email,
              picture: session.session.user.image,
              name: session.session.user.name,
              role: role,
            };

            if (role == "vendor" || role == "courier") {
              newUserInfo.status = "for-approval";
            }

            session.session.user = newUserInfo;
            await firestore.collection("users").doc().set(newUserInfo);
          } else {
            const user = userDoc.docs[0].data();
            session.session.user = {
              email: user.email,
              picture: user.picture,
              name: user.name,
              role: user.role,
            };
          }
        }

        return session.session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
}

const getRoleFromPath = (path) => {
  if (path == "/auth/login") {
    return "customer";
  } else if (path == "/role/vendor/auth/login") {
    return "vendor";
  } else if (path == "/role/courier/auth/login") {
    return "courier";
  } else if (path == "/role/admin/auth/login") {
    return "admin";
  }
};
