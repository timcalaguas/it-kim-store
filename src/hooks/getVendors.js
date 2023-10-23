import { firestore } from "../../firebase-config";

const getVendors = async (limit, query) => {
  try {
    const response = await firestore
      .collection("users")
      .where("role", "==", "vendor")
      .get();

    const vendorDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;

          return returnDoc;
        })
      : [];

    return vendorDocs;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getVendors;
