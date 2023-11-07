import { useRouter } from "next/router";
import axios from "axios";
import { signOut } from "firebase/auth";
import { firebase, auth } from "../../../firebase-config";

const AuthManager = () => {
  const router = useRouter();

  const logout = async (role) => {
    try {
      let redirect = "/auth/login";
      const response = await axios.delete("/api/auth");
      signOut(auth);
      if (response.status == 200) {
        if (role === "admin") redirect = "/role/admin/auth/login";
        if (role === "courier") redirect = "/role/courier/auth/login";
        if (role === "vendor") redirect = "/role/vendor/auth/login";

        router.push(redirect);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loginWithGoogle = async (role) => {
    try {
      let redirect = "/";

      const googleProvider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(googleProvider);
      const user = result.user;

      const response = await axios.post("/api/auth", {
        user: user,
        role: role,
      });

      console.log(response);

      if (response.status == 200) {
        if (role === "admin") redirect = "/role/admin/";
        if (role === "courier") redirect = "/role/courier/";
        if (role === "vendor") redirect = "/role/vendor/";

        return router.push(redirect);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { loginWithGoogle, logout };
};

export default AuthManager;
