import Cookies from "js-cookie";

import { login } from "@/store/slices/authSlice.ts";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const loginThunk =
  ({ email, password }) =>
  async (dispatch, getState) => {
    console.log("thunk", email, password);

    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.log("thunk", "login failed");
      throw new Error("Login failed");
    } else {
      const data = await response.json();

      console.log("thunk", "login success");
      Cookies.set("access_token", data.access_token, { expires: 1, path: "/" });
      dispatch(login(data));
    }
  };
