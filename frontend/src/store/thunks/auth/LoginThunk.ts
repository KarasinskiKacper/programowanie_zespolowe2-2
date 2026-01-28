import Cookies from "js-cookie";

import { login, logout } from "@/store/slices/authSlice.ts";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

/**
 * Fetches user data from the backend by providing an access token
 * @param {string} accessToken - access token to be used for authentication
 * @returns {Promise<Object>} The result of the fetch call as a JSON object
 */
export const fetchUserData = async (accessToken: string) => {
  const response = await fetch(`${BASE_URL}/get_user_info`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
};

/**
 * Logs a user in by sending a POST request to the backend with the provided email and password
 * @param {{ email: string, password: string }} The email and password of the user to be logged in
 * @returns {Promise<void>} A promise resolved when the login is successful or rejected
 */
export const loginThunk =
  ({ email, password }) =>
  async (dispatch, getState) => {
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

      const userDataResponse = await fetchUserData(data.access_token);
      if (!userDataResponse.ok) throw new Error("Login failed");

      const userData = await userDataResponse.json();

      dispatch(
        login({
          access_token: data.access_token,
          create_account_date: userData.create_account_date,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
        })
      );
    }
  };
  