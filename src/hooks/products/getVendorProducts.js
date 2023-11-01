import { firestore } from "../../../firebase-config";

const getVendorsProducts = async (id) => {
  const productsRef = firestore.collection("products");

  const response = await productsRef.where("vendorUID", "==", id).get();
  const vendor = await firestore.collection("users").doc(id).get();

  const vendorName =
    vendor.data().storeName != ""
      ? vendor.data().storeName
      : vendor.data().name;

  const productDocs = !response.empty
    ? response.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;
        returnDoc.vendor = vendorName;
        return returnDoc;
      })
    : [];

  return { productDocs, vendorName };
};

export default getVendorsProducts;
