const fillNewUserData = (user, role) => {
  let newUser = {
    name: user.displayName,
    email: user.email,
    picture: user.photoURL,
    role: role,
    addresses: [],
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
