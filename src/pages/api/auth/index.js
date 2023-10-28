import { firestore } from "../../../../firebase-config";
import { withSessionRoute } from "@/lib/withSession";
import fillNewUserData from "@/hooks/auth/fillNewUserData";

export default withSessionRoute(createSessionRoute);

async function createSessionRoute(req, res) {
  if (req.method === "POST") {
    try {
      const user = req.body.user;
      const role = req.body.role;

      const response = await firestore
        .collection("users")
        .where("email", "==", user.email)
        .limit(1)
        .get();

      if (!response.empty) {
        const firebaseUser = response.docs[0].data();
        firebaseUser.docId = response.docs[0].id;

        req.session.user = firebaseUser;
        await req.session.save();

        res.status(200).json({ message: "Sign In Successful" });
      } else {
        const newUser = fillNewUserData(user, role);

        const createUserResponse = await firestore
          .collection("users")
          .doc(user.uid)
          .set(newUser);

        req.session.user = newUser;

        await req.session.save();
        res.status(200).json({ message: "Sign Up Successful" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Authentication failed" });
    }
  } else if (req.method === "DELETE") {
    req.session.destroy();
    res.send({ ok: true });
  }

  return res.status(404).send("");
}
