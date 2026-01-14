import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { useAppDispatch, useAppSelector } from "@/store/store";
import React, { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { autoLogin } from "@/store/thunks/auth/AutoLogin";
import { loginThunk } from "@/store/thunks/auth/LoginThunk";
import { logout } from "@/store/slices/authSlice.ts";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = React.useState("daniel.nowacki@gmail.com");
  const [phone, setPhone] = React.useState("505 677 327");

  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  useEffect(() => {
    try {
      dispatch(autoLogin());
    } catch (e) {
      router.push("/logowanie");
    }
  }, []);

  return (
    <div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
      <div className="w-full max-w-[1400px] inline-flex justify-center items-start gap-16">
        <div className="flex-1 p-16 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-center gap-8">
          <div className="w-64 h-64 relative bg-zinc-400 rounded-[999px]" />
          <div className="flex flex-col justify-center items-start gap-8">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="inline-flex justify-start items-center gap-8">
                <div className="justify-start text-black text-6xl font-bold font-['Inter']">
                  Daniel Nowacki
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter']">
                    Email
                  </div>
                  <input
                    className="justify-start text-black text-2xl font-normal font-['Inter']"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter']">
                    Nr tel:
                  </div>
                  <input
                    className="justify-start text-black text-2xl font-normal font-['Inter']"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter']">
                    Dołączył:
                  </div>
                  <div className="justify-start text-black text-2xl font-normal font-['Inter']">
                    15.12.2025
                  </div>
                </div>
              </div>
            </div>
            <Button label="Wyloguj" btnStyle="outline" onClick={() => dispatch(logout())} />
            <Button label="Zapisz zmiany" onClick={() => {}} />
          </div>
        </div>
        <div className="flex-1 self-stretch p-16 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-center gap-16">
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            <TextInput
              label="Stare hasło"
              placeholder="Podaj stare hasło..."
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              variant="outline"
            />
            <TextInput
              label="Nowe hasło"
              placeholder="Podaj nowe hasło..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outline"
            />
            <TextInput
              label="Powtórz nowe hasło"
              placeholder="Powtórz nowe hasło..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outline"
            />
          </div>
          <Button label="Zmień hasło" onClick={() => {}} size="large" />
        </div>
      </div>
    </div>
  );
}
