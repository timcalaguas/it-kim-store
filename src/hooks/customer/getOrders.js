import { firestore } from "../../../firebase-config";

const getOrders = async (userId) => {
  const result = {
    orderPlaced: [],
    inTransit: [],
    completed: [],
  };
  try {
    const orderResponse = await firestore
      .collection("orders")
      .where("customer.id", "==", userId)
      .get();

    const orders = !orderResponse.empty
      ? orderResponse.docs.map((order) => {
          const orderDoc = order.data();
          orderDoc.id = order.id;

          return orderDoc;
        })
      : [];

    const result = {
      orderPlaced: [],
      inTransit: [],
      completed: [],
    };

    orders.map((order) => {
      const status = order.status;

      if (status) {
        if (status == "order-placed" || status == "order-declined") {
          result.orderPlaced.push(order);
        } else if (status == "in-transit" || status == "courier-accepted") {
          result.inTransit.push(order);
        } else if (status == "completed") {
          result.completed.push(order);
        }
      }
    });

    return result;
  } catch (error) {
    return result;
  }
};

export default getOrders;
