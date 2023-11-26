import { firestore } from "../../../firebase-config";

const getAdminOrders = async (role) => {
  try {
    const response = await firestore.collection("orders").get();

    const orderDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;

          return returnDoc;
        })
      : [];

    return orderDocs;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getAdminOrders;
