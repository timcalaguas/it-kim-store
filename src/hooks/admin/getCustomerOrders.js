import { firestore } from "../../../firebase-config";

const getCustomerOrders = async (id) => {
  try {
    const response = await firestore
      .collection("orders")
      .where("customer.id", "==", id)
      .get();

    const customer = await firestore.collection("users").doc(id).get();

    const customerDoc = customer.data();

    let orderDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;
          return returnDoc;
        })
      : [];

    return { orderDocs, customerDoc };
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getCustomerOrders;
