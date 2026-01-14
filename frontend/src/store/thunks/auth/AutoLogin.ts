import Cookies from "js-cookie";

import { login } from "@/store/slices/authSlice.ts";

const getToken = () => {
  const token = Cookies.get("access_token");
  console.log(token);

  return token;
};

export const autoLogin = () => (dispatch, getState) => {
  const cookie = getToken();
  console.log("autoLogin", cookie);

  if (cookie) {
    dispatch(login({ access_token: cookie }));
  }
};
