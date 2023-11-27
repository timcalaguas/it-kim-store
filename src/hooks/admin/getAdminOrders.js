import { firestore } from "../../../firebase-config";

const getAdminOrders = async (role) => {
  try {
    const response = await firestore.collection("orders").get();

    let orderDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          returnDoc.id = doc.id;
          return returnDoc;
        })
      : [];

    console.log(orderDocs);

    const filteredArray = orderDocs.filter(
      (order) => order.status == "delivered" || order.status == "received"
    );

    return filteredArray;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getAdminOrders;
