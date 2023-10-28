import { firestore } from "../../../firebase-config";

const getAllProducts = async () => {
  try {
    const response = await firestore.collection("products").get();

    const productDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;

          return returnDoc;
        })
      : [];

    return productDocs;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getAllProducts;
