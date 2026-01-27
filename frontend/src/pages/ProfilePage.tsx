import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/store/slices/authSlice.ts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAuth, formatAuthDate } from "@/store/slices/authSelector";

import { handleAutoLoginWithRerouteToLoginPage } from "@/components/AutoLoginHandler";
import { changePasswordThunk } from "@/store/thunks/auth/ChangePasswordThunk";
import { Avatar } from "@/components/Avatar";
import { setSearch } from "@/store/slices/auctionSlice";
import { setSelectedCategoryId } from "@/store/slices/categoriesSlice";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    isAuthenticated,
    access_token,
    create_account_date,
    email,
    first_name,
    last_name,
    phone_number,
  } = useAppSelector(selectAuth);

  const [newEmail, setNewEmail] = React.useState(email || "");
  const [newPhone, setNewPhone] = React.useState(phone_number || "");

  const [oldPassword, setOldPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  handleAutoLoginWithRerouteToLoginPage();

  useEffect(() => {
    setNewEmail(email ?? "");
  }, [email]);

  useEffect(() => {
    setNewPhone(phone_number ?? "");
  }, [phone_number]);

  return (
    <div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
      <div className="w-full max-w-[1400px] inline-flex justify-center items-start gap-16">
        <div className="flex-1 p-16 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-center gap-8">
          <Avatar size={64 * 4} />
          <div className="flex flex-col justify-center items-start gap-8">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="inline-flex justify-start items-center gap-8">
                <div className="justify-start text-black text-6xl font-bold font-['Inter']">
                  {first_name} {last_name}
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter'] gap-2">
                    Email:
                    <div className="justify-start text-black text-2xl font-normal font-['Inter']">
                      {newEmail}
                    </div>
                  </div>
                  {/* <input
                    className="justify-start text-black text-2xl font-normal font-['Inter']"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  /> */}
                </div>
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter'] gap-2">
                    Nr tel:
                    <div className="justify-start text-black text-2xl font-normal font-['Inter']">
                      {newPhone}
                    </div>
                  </div>
                  {/* <input
                    className="justify-start text-black text-2xl font-normal font-['Inter']"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  /> */}
                </div>
                <div className="inline-flex justify-start items-start gap-4">
                  <div className="justify-start text-neutral-500 text-2xl font-normal font-['Inter']">
                    Dołączył:
                  </div>
                  <div className="justify-start text-black text-2xl font-normal font-['Inter']">
                    {formatAuthDate(create_account_date)}
                  </div>
                </div>
              </div>
            </div>
            <Button
              label="Wyloguj"
              btnStyle="outline"
              onClick={() => {
                dispatch(setSelectedCategoryId(null));
                dispatch(setSearch(""));
                dispatch(logout());
                router.push("/logowanie");
              }}
            />
            {/* <Button label="Zapisz zmiany" onClick={ async () => {
              
            }} /> */}
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
              type="password"
            />
            <TextInput
              label="Nowe hasło"
              placeholder="Podaj nowe hasło..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outline"
              type="password"
            />
            <TextInput
              label="Powtórz nowe hasło"
              placeholder="Powtórz nowe hasło..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outline"
              type="password"
            />
          </div>
          {error && (
            <div className="justify-start text-red-600 text-base font-bold font-['Inter']">
              {error}
            </div>
          )}
          {success && (
            <div className="justify-start text-green-600 text-base font-bold font-['Inter']">
              {success}
            </div>
          )}
          <Button
            label="Zmień hasło"
            onClick={async () => {
              if (!password) {
                setError("Nowe hasło jest wymagane");
                return;
              }
              if (!oldPassword) {
                setError("Stare hasło jest wymagane");
                return;
              }
              if (password !== confirmPassword) {
                setError("Hasła muszą być identyczne");
                return;
              }
              setError("");

              if (await dispatch(changePasswordThunk({ oldPassword, newPassword: password }))) {
                setError("");
                setSuccess("Hasło zostało zmienione pomyślnie");
              } else {
                setSuccess("");
                setError("Nie udało się zmienić hasła.");
              }
            }}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
