const fillNewUserData = (user, role) => {
  const parts = user.email.split("@");

  let newUser = {
    name: user.displayName != null ? user.displayName : parts[0],
    email: user.email,
    picture: user.photoURL != null ? user.photoURL : "",
    role: role,
    addresses: [],
    status: "approved",
  };

  if (role == "vendor") {
    newUser.storeLogo = "";
    newUser.storeName = "";
    newUser.status = "pending";
  }

  if (role == "courier") {
    newUser.status = "pending";
  }

  return newUser;
};

export default fillNewUserData;
