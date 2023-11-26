import { firestore } from "../../../firebase-config";

const geVendorDashboardCount = async (id) => {
  const products = await firestore
    .collection("products")
    .where("vendorUID", "==", id)
    .get();

  const orders = await firestore
    .collection("orders")
    .where("vendorId", "==", id)
    .get();

  const sales = await firestore
    .collection("orders")
    .where("vendorId", "==", id)
    .get();

  const receivedItems = sales.docs.filter(
    (item) => item.data().status === "received"
  );

  const productCount = products.size;
  const orderCount = orders.size;
  const salesReport = receivedItems.length;

  return { productCount, orderCount, salesReport };
};

export default geVendorDashboardCount;
