import { firestore } from "../../firebase-config";

const getProducts = async (limit, query) => {
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


const sortedProductDocs = productDocs.sort((a, b) => b.averageStarRating - a.averageStarRating);


const top3Products = sortedProductDocs.slice(0, 3);

    return top3Products;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getProducts;
