import { firestore } from "../../firebase-config";

const getProducts = async (limit, query) => {
  try {
    const response = await firestore.collection("products").limit(limit).get();

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

export default getProducts;
