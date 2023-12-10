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

    const vendors = await firestore.collection("users").get();

    const orders = !orderResponse.empty
      ? orderResponse.docs.map((order) => {
          const orderDoc = order.data();
          orderDoc.id = order.id;
          if (!vendors.empty) {
            vendors.docs.map((vendor) => {
              console.log(vendor.id, orderDoc.vendorId);
              if (vendor.id == orderDoc.vendorId) {
                orderDoc.qr = vendor.data().qr ? vendor.data().qr : "";
              }
            });
          }

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
        if (
          status == "order-placed" ||
          status == "order-declined" ||
          status == "order-accepted" ||
          status == "cancelled" ||
          status == "payment-needed" ||
          status == "paid"
        ) {
          result.orderPlaced.push(order);
        } else if (status == "in-transit" || status == "courier-accepted") {
          result.inTransit.push(order);
        } else if (status == "delivered" || status == "received") {
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
