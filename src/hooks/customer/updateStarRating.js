import { firestore } from "../../../firebase-config";

const updateStarRating = async (email) => {
  const userDoc = await firestore
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  const ratings = await firestore
    .collection("ratings")
    .where("userEmail", "==", email)
    .get();

  let newRating = 0;
  const userData = userDoc.docs[0].data();

  const ratingDocs = !ratings.empty
    ? ratings.docs.map((rating) => {
        const ratingData = rating.data();
        newRating = newRating + ratingData.starRating;
        return rating.data();
      })
    : [];

  console.log(userData, ratingDocs, newRating);

  newRating = newRating / ratingDocs.length;
  newRating = parseFloat(newRating.toFixed(2));

  const updateDoc = await firestore
    .collection("users")
    .doc(userDoc.docs[0].id)
    .set({
      ...userData,
      rating: newRating,
    });
};

export default updateStarRating;
