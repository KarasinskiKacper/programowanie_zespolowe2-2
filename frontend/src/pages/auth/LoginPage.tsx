import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useRouter } from "next/dist/client/components/navigation";
import { loginThunk } from "@/store/thunks/auth/LoginThunk";

import React from "react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);

  const handleOnLoginClick = async () => {
    if (!email) {
      setError("E-mail jest wymagany");
      return;
    }
    if (!password) {
      setError("Hasło jest wymagane");
      return;
    }

    try {
      await dispatch(loginThunk({ email, password }));
      router.push("/");
    } catch (e) {
      setError("Błędny login lub hasło");
    }
    // dispatch(loginThunk({ email, password }));
  };

  return (
    <div className="self-stretch flex-1 inline-flex justify-start items-start overflow-hidden">
      <div className="flex-1 self-stretch p-16 inline-flex flex-col justify-center items-start gap-8 overflow-hidden">
        <div className="self-stretch flex-1 py-8 bg-zinc-100 flex flex-col justify-center items-center gap-16 overflow-hidden">
          <img width="460" height="320" src="/cards.png" />
        </div>
        <div className="justify-start text-orange-600 text-6xl font-bold font-['Inter']">
          Nie przegap okazji!
        </div>
      </div>
      <div className="self-stretch py-16 flex justify-start items-center gap-2.5 overflow-hidden">
        <div className="w-1 self-stretch relative bg-orange-600 rounded-lg" />
      </div>
      <div className="flex-1 self-stretch p-16 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
        <div className="justify-start text-orange-600 text-6xl font-bold font-['Inter']">
          Zaloguj się
        </div>
        <div className="self-stretch p-8 bg-zinc-100 flex flex-col justify-start items-start gap-16 overflow-hidden">
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <TextInput
                label="E-mail"
                placeholder="Wpisz swój e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                label="Hasło"
                type="password"
                placeholder="Wpisz swoje hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <div className="justify-start text-red-600 text-base font-bold font-['Inter']">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
        <Button label="Zaloguj się" onClick={handleOnLoginClick} />
        <div className="self-stretch flex-1 inline-flex justify-center items-center gap-4">
          <div className="flex-1 h-0.5 relative bg-neutral-400 rounded-lg" />
          <div className="justify-start text-black text-base font-bold font-['Inter']">
            Nie masz konta?
          </div>
          <div className="flex-1 h-0.5 relative bg-neutral-400 rounded-lg" />
        </div>
        <Button
          label="Zarejestruj się"
          btnStyle="outline"
          onClick={() => {
            router.push("/rejestracja");
          }}
        />
      </div>
    </div>
  );
}
