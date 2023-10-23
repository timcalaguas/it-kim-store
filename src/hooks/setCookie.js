import cookieCutter from "cookie-cutter";

export default function setCookie(name, value) {
  cookieCutter.set(name, value);
}
