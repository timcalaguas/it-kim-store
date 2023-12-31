import { firestore } from "../../firebase-config";

const getUsers = async (role) => {
  try {
    const response = await firestore
      .collection("users")
      .where("role", "==", role)
      .get();

    let userDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;
          console.log(returnDoc);
          return returnDoc;
        })
      : [];

    return userDocs;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getUsers;
