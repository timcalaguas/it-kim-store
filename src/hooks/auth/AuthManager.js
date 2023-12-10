import { useRouter } from "next/router";
import axios from "axios";
import { signOut } from "firebase/auth";
import { firebase, auth } from "../../../firebase-config";
import { useToast } from "@chakra-ui/react";
import { useState } from "react";

const AuthManager = () => {
  const toast = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

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
        if (response.data.message == "Not included on Admin Emails") {
          toast({
            title: "Email used is not Included on the allowed Admin Emails",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          console.log("Not Included");
        } else {
          if (role === "admin") redirect = "/role/admin/";
          if (role === "courier") redirect = "/role/courier/";
          if (role === "vendor") redirect = "/role/vendor/";

          return router.push(redirect);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loginWithEmailAndPassword = async (email, password, role) => {
    try {
      setIsLoading(true);
      let redirect = "/";
      const result = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      const user = result.user;

      console.log(result);

      const response = await axios.post("/api/auth", {
        user: user,
        role: role,
      });
      setIsLoading(false);
      console.log(response);

      if (response.status == 200) {
        if (response.data.message == "Not included on Admin Emails") {
          toast({
            title: "Email used is not Included on the allowed Admin Emails",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          console.log("Not Included");
        } else {
          if (role === "admin") redirect = "/role/admin/";
          if (role === "courier") redirect = "/role/courier/";
          if (role === "vendor") redirect = "/role/vendor/";

          return router.push(redirect);
        }
      }
      console.log("Signed in with email and password:", user);
    } catch (error) {
      setIsLoading(false);
      if (
        error.message ==
        "Firebase: The email address is badly formatted. (auth/invalid-email)."
      ) {
        toast({
          title: "The email address is badly formatted",
          description: "Please check the format of the email address",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      if (
        error.message == "Firebase: Error (auth/invalid-login-credentials)."
      ) {
        toast({
          title: "Incorrect email address or password.",
          description: "Contact itikim.web@gmail.com to reset your password",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const signUpWithEmailAndPassword = async (email, password, role) => {
    try {
      setIsLoading(true);
      let redirect = "/";
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      const user = result.user;

      console.log(result);

      const response = await axios.post("/api/auth", {
        user: user,
        role: role,
      });
      setIsLoading(false);

      console.log(response);

      if (response.status == 200) {
        if (response.data.message == "Not included on Admin Emails") {
          toast({
            title: "Email used is not Included on the allowed Admin Emails",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          console.log("Not Included");
        } else {
          if (role === "admin") redirect = "/role/admin/";
          if (role === "courier") redirect = "/role/courier/";
          if (role === "vendor") redirect = "/role/vendor/";

          return router.push(redirect);
        }
      }
      console.log("Signed in with email and password:", user);
    } catch (error) {
      setIsLoading(false);
      console.log(error.message);
      if (
        error.message ==
        "Firebase: The email address is badly formatted. (auth/invalid-email)."
      ) {
        toast({
          title: "The email address is badly formatted",
          description: "Please check the format of the email address",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      if (
        error.message ==
        "Firebase: Password should be at least 6 characters (auth/weak-password)."
      ) {
        toast({
          title: "Password should be at least 6 characters",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      if (
        error.message ==
        "Firebase: The email address is already in use by another account. (auth/email-already-in-use)."
      ) {
        toast({
          title: "The email address is already in use by another account.",
          description: "Please use another email address.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return {
    loginWithGoogle,
    loginWithEmailAndPassword,
    signUpWithEmailAndPassword,
    logout,
    isLoading,
  };
};

export default AuthManager;
