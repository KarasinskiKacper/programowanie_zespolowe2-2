import { Button } from "@/components/inputs/Button";
import { useAppDispatch, useAppSelector } from "@/store/store";
import React from "react";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseISO, format } from 'date-fns'

import { useCountdown } from "@/hooks/useCountdown";


import { getAuctionPhotoThunk, getAuctionDetailsThunk } from "@/store/thunks/AuctionsThunk";
import { CategoryItem } from "@/components/CategoryItem";

export default function AuctionPage() {
	const dispatch = useAppDispatch();
	const params = useParams()
	const auctionId = params['auction-slug']
	
	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

	const [auctionData, setAuctionData] = useState(null);
	const [endDate, setEndDate] = useState<string | null>(null)

	const categoryItems = ["RTV/AGD", "Elektronika", "Dom", "Auto", "Dzieci"] // TODO dostarczyć listę kategiorii

	useEffect(() => {
		(async () => {
			const auctionDetails = await dispatch(getAuctionDetailsThunk(auctionId));
			console.log(auctionDetails);

			const imagesUrl = [auctionDetails.main_photo, ...auctionDetails.photos];
			const images = []
			await imagesUrl.forEach(async (imageUrl) => {
				const photoData = await dispatch(getAuctionPhotoThunk(imageUrl));
				images.push(photoData);
				console.log(imageUrl);
				
			})

			const data = {
				title: auctionDetails.title,
				startPrice: Math.round(auctionDetails.start_price),
				price: Math.round(auctionDetails.current_price),
				time: auctionDetails.end_date,
				owner: {
					name: auctionDetails.owner_name,
					avatarUrl: "", // TODO: add avatar url
					id: auctionDetails.id_owner,
				},
				winner: {
					name: auctionDetails.winner_name,
					avatarUrl: "", // TODO: add avatar url
					id: auctionDetails.id_winner,
					time:  auctionDetails.id_winner ? auctionDetails.end_date : null,
				},
				startDate: auctionDetails.start_date,
				endDate: auctionDetails.end_date,
				description: auctionDetails.description.trim(),
				images: images,
			}
			console.log(data.images);
			setEndDate(data.endDate)
			setAuctionData(data);
		})();
	}, []);

	const timeLeft = useCountdown(endDate);

	const auctionDataOld: any = {
		title: "Ekspres ciśnieniowy DeLonghi Magnifica Start ECAM220.80.SB 1450W",
		startPrice: 1000,
		price: 1999,
		images: [
			"https://goldenmark.com/blog/wp-content/uploads/2021/05/gwiazdzista-noc.jpg",
			"https://t3.ftcdn.net/jpg/04/75/10/10/240_F_475101004_5EyfhlZWZCUNhBl3qBWq6eYC3fXGGQCx.jpg",
			"https://www.dobrasztuka.pl/wp-content/uploads/2024/10/Portret-recznie-malowany-kubizm-Uspione-piekno-2316A-800x800.jpg",
			"https://cdn2.nowiny.pl/im/v1/news-900-widen-wm/2023/01/12/216153_1673518945_76504600.webp",
		],
		time: "2 dni 4 godz",
		owner: {
			name: "Daniel Nowacki",
			avatarUrl: "",
		},
		winner: {
			name: "Robert Ryś",
			avatarUrl: "",
			time: "14.12.2025 13:20",
		},
		startDate: "14.12.2025 13:20",
		endDate: "14.12.2025 13:20",
		description: `
# Laptop Lenovo – niezawodna wydajność na co dzień

Laptop **Lenovo** to połączenie solidnego wykonania, nowoczesnego designu i wydajnych podzespołów, które sprawdzą się zarówno w pracy, nauce, jak i codziennym użytkowaniu. To sprzęt zaprojektowany z myślą o stabilności, komforcie i długiej żywotności.

## Najważniejsze cechy
- **Wydajny procesor** – płynna praca wielozadaniowa, szybkie uruchamianie aplikacji
- **Czytelny ekran** – komfort dla oczu podczas pracy i rozrywki
- **Szybki dysk SSD** – błyskawiczny start systemu i aplikacji
- **Ergonomiczna klawiatura Lenovo** – wygodne pisanie nawet przez wiele godzin
- **Solidna konstrukcja** – trwałość i niezawodność w codziennym użytkowaniu

## Idealny do:
- pracy biurowej i zdalnej
- nauki i zajęć online
- przeglądania internetu i multimediów
- podstawowej obróbki dokumentów i grafiki

## Dlaczego Lenovo?
Lenovo od lat słynie z niezawodnych laptopów, które oferują doskonały stosunek jakości do ceny. To wybór dla osób, które oczekują stabilności, komfortu pracy i sprawdzonej technologii.

**Laptop Lenovo** to praktyczne i uniwersalne rozwiązanie, które dopasuje się do Twoich codziennych potrzeb.
`.trim(),
	};

	return (
		<div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden ">
			<div className="w-full max-w-[1400px] flex flex-col justify-start items-start gap-16 overflow-hidden">
				<div className="self-stretch inline-flex justify-start items-center gap-8 ">
					<div className="self-stretch flex-1 p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-4">
						<div className="self-stretch justify-start text-black text-3xl font-bold font-['Inter']">{auctionData?.title}</div>
						<div className="self-stretch h-full flex flex-col justify-start items-start gap-8">
							<img
								src={auctionData?.images[selectedImageIndex]?.length>3 ? auctionData?.images[selectedImageIndex] : "/no-image.png"}
								className={`self-stretch w-full h-full object-contain`}
							/>
							<div className="self-stretch inline-flex justify-start items-center gap-4">
								{auctionData?.images.map((image: string, index: number) => (
									<div key={index} className="w-32 h-32 bg-neutral-400">
										<img
											src={image?.length>3 ? image : "/no-image.png"}
											className={`w-full h-full object-cover ${index === selectedImageIndex ? "border-4 border-brand-primary" : ""}`}
											onClick={() => setSelectedImageIndex(index)}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="w-[512px] self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
						<div className="self-stretch flex flex-col justify-start items-start">
							<div className="self-stretch text-center justify-start text-zinc-400 text-xl font-bold font-['Inter']">Czas do końca aukcji</div>
							<div className="self-stretch text-center justify-start text-black text-3xl font-bold font-['Inter']">{timeLeft}</div>
						</div>
						<div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
						<div className="self-stretch flex flex-col justify-start items-start gap-8">
							<div className="flex flex-col justify-start items-start gap-2">
								<div className="inline-flex justify-center items-end gap-1">
									<div className="justify-start text-brand-primary text-8xl font-bold font-['Inter']">{auctionData?.price}</div>
									<div className="justify-start text-brand-primary text-6xl font-bold font-['Inter']">zł</div>
								</div>
								<div className="inline-flex justify-start items-center gap-2">
									<div className="w-16 h-16 relative bg-zinc-400 rounded-[64px]" />
									<div className="inline-flex flex-col justify-center items-start gap-1">
										<div className="justify-start text-black text-xl font-bold font-['Inter']">
											{auctionData?.winner?.name}
										</div>
										<div className="justify-start text-neutral-500 text-xl font-normal font-['Inter']">{auctionData?.winner?.time && format(parseISO(auctionData?.winner?.time), "dd.MM.yyyy HH:mm")}</div>
									</div>
								</div>
							</div>
							<div className="self-stretch inline-flex justify-start items-start gap-4">
                                <input type="number" className="flex-1 h-12 border-2 border-orange-600 px-4 text-2xl" />
								<Button label="Przebij" onClick={() => {}} size="small" />
							</div>
						</div>
						<div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
						<div className="flex flex-col justify-start items-start gap-4">
							<div className="inline-flex justify-start items-center gap-2">
								<div className="w-8 h-8 relative bg-zinc-400 rounded-[64px]" />
								<div className="justify-start text-black text-xl font-bold font-['Inter']">
									{auctionData?.owner?.name}
								</div>
							</div>
							<div className="flex flex-col justify-start items-start gap-1">
								<div className="inline-flex justify-start items-start gap-2">
									<div className="justify-start text-black text-xl font-normal font-['Inter']">Cena początkowa:</div>
									<div className="justify-start text-black text-xl font-normal font-['Inter']">{auctionData?.startPrice}zł</div>
								</div>
								<div className="inline-flex justify-start items-start gap-2">
									<div className="justify-start text-black text-xl font-normal font-['Inter']">Start aukcji:</div>
									<div className="justify-start text-black text-xl font-normal font-['Inter']">{auctionData?.startDate && format(parseISO(auctionData?.startDate), "dd.MM.yyyy HH:mm")}</div>
								</div>
								<div className="inline-flex justify-start items-start gap-2">
									<div className="justify-start text-black text-xl font-normal font-['Inter']">Koniec aukcji: </div>
									<div className="justify-start text-black text-xl font-normal font-['Inter']">{auctionData?.endDate && format(parseISO(auctionData?.endDate), "dd.MM.yyyy HH:mm")}</div>
								</div>
							</div>
						</div>
						<div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
						<div className="flex-col self-stretch text-2xl font-semibold text-orange-600 gap-2">
							Kategorie:
							<div className="gap-4 flex-wrap">
								{categoryItems.map(category => <CategoryItem 
									label={category}
									onClick={()=>{}}
									selected={true}
									selectable={false}
								/>)}
							</div>
						</div>
					</div>
				</div>
				<div className="self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 flex flex-col justify-start items-start gap-4 overflow-hidden">
					<div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">Opis</div>
					<div className="self-stretch justify-start flex-col">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{auctionData?.description}</ReactMarkdown>
					</div>
				</div>
			</div>
		</div>
	);
}
