import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { autoLoginThunk } from "@/store/thunks/auth/AutoLoginThunk";

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
