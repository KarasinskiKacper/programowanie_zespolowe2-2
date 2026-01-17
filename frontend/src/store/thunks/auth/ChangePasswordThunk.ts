import { login, logout } from "@/store/slices/authSlice.ts";
import { autoLoginThunk } from "./AutoLoginThunk";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

export const changePasswordThunk =
  ({ oldPassword, newPassword }) =>
  async (dispatch, getState) => {
    const accessToken = getState().auth.access_token;

    const response = await fetch(`${BASE_URL}/change_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });

    return response.ok;
  };
