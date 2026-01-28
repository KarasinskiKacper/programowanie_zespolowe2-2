import { login, logout } from "@/store/slices/authSlice.ts";
import { autoLoginThunk } from "./AutoLoginThunk";

const BASE_URL = `${process.env.BASE_BACKEND_API_URL}/api`;

/**
 * Change password of user in backend
 * @param {object} params - object with oldPassword and newPassword
 * @param {function} dispatch - dispatch function from redux
 * @param {object} getState - state of application
 * @returns {Promise<boolean>} - promise with result of change password operation
 */
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
