import Cookies from "js-cookie";

import { login, logout } from "@/store/slices/authSlice.ts";
import { fetchUserData } from "./LoginThunk";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const getToken = () => {
  const token = Cookies.get("access_token");
  return token;
};

export const autoLoginThunk = () => async (dispatch, getState) => {
  const cookie = getToken();

  if (!cookie) {
    return false;
  }

  const userDataResponse = await fetchUserData(cookie);
  if (!userDataResponse.ok) {
    dispatch(logout());
    return false;
  }
  const userData = await userDataResponse.json();

  dispatch(
    login({
      access_token: cookie,
      create_account_date: userData.create_account_date,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone_number: userData.phone_number,
    })
  );

  return true;
};
