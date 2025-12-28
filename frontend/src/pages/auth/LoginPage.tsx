import { Button } from "@/components/inputs/Button";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useRouter } from "next/dist/client/components/navigation";

export default function LoginPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	return (
		<div className="self-stretch flex-1 inline-flex justify-start items-start overflow-hidden">
			<div className="flex-1 self-stretch p-16 inline-flex flex-col justify-center items-start gap-8 overflow-hidden">
				<div className="self-stretch flex-1 py-8 bg-zinc-100 flex flex-col justify-center items-center gap-16 overflow-hidden">
					<img width="460" height="320" src="/cards.png" />
				</div>
				<div className="justify-start text-orange-600 text-6xl font-bold font-['Inter']">Nie przegap okazji!</div>
			</div>
			<div className="self-stretch py-16 flex justify-start items-center gap-2.5 overflow-hidden">
				<div className="w-1 self-stretch relative bg-orange-600 rounded-lg" />
			</div>
			<div className="flex-1 self-stretch p-16 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
				<div className="justify-start text-orange-600 text-6xl font-bold font-['Inter']">Zaloguj się</div>
				<div className="self-stretch p-8 bg-zinc-100 flex flex-col justify-start items-start gap-16 overflow-hidden">
					<div className="self-stretch flex flex-col justify-start items-start gap-8">
						<div className="self-stretch flex flex-col justify-start items-start gap-2">
							<div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">E-mail</div>
							<input type="text" className="self-stretch h-12 relative bg-white outline-0 p-2" placeholder="imie.nazwisko@gmail.com" />
						</div>
						<div className="self-stretch flex flex-col justify-start items-start gap-2">
							<div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">Hasło</div>
							<input type="password" className="self-stretch h-12 relative bg-white outline-0 p-2" placeholder="Wpisz swoje hasło" />
						</div>
					</div>
				</div>
				<Button label="Zaloguj się" onClick={() => {}} />
				<div className="self-stretch flex-1 inline-flex justify-center items-center gap-4">
					<div className="flex-1 h-0.5 relative bg-neutral-400 rounded-lg" />
					<div className="justify-start text-black text-base font-bold font-['Inter']">Nie masz konta?</div>
					<div className="flex-1 h-0.5 relative bg-neutral-400 rounded-lg" />
				</div>
				<Button label="Zarejestruj się" btnStyle="outline" onClick={() => {router.push("/rejestracja")}} />
			</div>
		</div>
	);
}
