import { firestore } from "../../firebase-config";

const AddRole = async (email, role) => {
  try {
    const userDocRef = firestore
      .collection("users")
      .where("email", "==", email)
      .limit(1);
    const userDoc = await userDocRef.get();

    if (!userDoc.empty) {
      const user = userDoc.docs[0].data();
      if (user.role == "") {
        await firestore.collection("users").doc(userDoc.docs[0].id).set({
          email: user.email,
          picture: user.image,
          name: user.name,
          role: role,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default AddRole;
