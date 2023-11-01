import { firestore } from "../../../firebase-config";

const getAllProducts = async () => {
  try {
    const response = await firestore.collection("products").get();

    const vendors = await firestore
      .collection("users")
      .where("role", "==", "vendor")
      .get();

    const productDocs = !response.empty
      ? response.docs.map((doc) => {
          const returnDoc = doc.data();
          vendors.docs.map((vendor) => {
            if (vendor.id == returnDoc.vendorUID) {
              returnDoc.vendor =
                vendor.data().storeName != ""
                  ? vendor.data().storeName
                  : vendor.data().name;
            }
          });
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
