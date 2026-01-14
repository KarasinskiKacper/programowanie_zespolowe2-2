import Cookies from "js-cookie";

import { login } from "@/store/slices/authSlice.ts";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const registerThunk =
  ({ email, password, name, surname, phone }) =>
  async (dispatch, getState) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        first_name: name,
        last_name: surname,
        phone_number: phone,
      }),
    });
    if (!response.ok) {
      throw new Error("Registration failed");
    } else {
      const data = await response.json();
      Cookies.set("access_token", data.access_token, { expires: 1, path: "/" });
      dispatch(login(data));
    }
  };

export const isEmailTaken = async (email: string) => {
  const response = await fetch(`${BASE_URL}/is_email_taken?email=${email}`, {
    method: "GET",
  });
  const data = await response.json();
  return data.exists;
};
