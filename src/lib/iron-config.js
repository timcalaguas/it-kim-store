export const ironOptions = {
  cookieName: "it-kim-auth",
  password: process.env.IRON_SECRET_KEY,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production" ? true : false,
  },
};
