import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { autoLoginThunk } from "@/store/thunks/auth/AutoLoginThunk";

/**
 * Automatically logs in a user by retrieving the access token from the cookies.
 * If the access token is invalid, logs out the user.
 * @returns {Promise<void>} A promise resolved when the login process is finished.
 */
export async function handleAutoLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAutoLoginDispatch = async () => {
    await dispatch(autoLoginThunk());
  };

  useEffect(() => {
    handleAutoLoginDispatch();
  }, []);
}

/**
 * Automatically logs in a user by retrieving the access token from the cookies.
 * If the access token is invalid, logs out the user and redirects to the login page.
 * @returns {Promise<void>} A promise resolved when the login process is finished.
 */
export async function handleAutoLoginWithRerouteToLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAutoLoginDispatch = async () => {
    if (!(await dispatch(autoLoginThunk()))) {
      router.push("/logowanie");
    }
  };

  useEffect(() => {
    handleAutoLoginDispatch();
  }, []);
}
