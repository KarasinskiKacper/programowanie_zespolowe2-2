import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { useAppDispatch, useAppSelector } from "@/store/store";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NewAuctionPage() {
	const dispatch = useAppDispatch();

	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

	const [images, setImages] = React.useState<Array<any>>([]);
	const [title, setTitle] = React.useState("Tytuł produktu");
	const [startPrice, setStartPrice] = React.useState("100");
	const [description, setDescription] = React.useState("Opis produktu");

	const onAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const url = URL.createObjectURL(file);
		setImages((prev) => [...prev, url]);

		e.target.value = "";
	};

	return (
		<div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
			<div className="w-full max-w-[1400px] flex flex-col justify-start items-start gap-16 overflow-hidden">
				<div className="self-stretch inline-flex justify-start items-center gap-8">
					<div className="flex-1 p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-4">
						<input value={title} onChange={(e) => setTitle(e.target.value)} className="self-stretch justify-start text-black text-3xl font-bold font-['Inter']" />
						<div className="self-stretch flex flex-col justify-start items-start gap-8">
							<img src={images[selectedImageIndex]} className={`w-full h-full object-contain max-h-96`} />
							<div className="self-stretch inline-flex justify-start items-center gap-4 overflow-hidden">
								{images.map((image: string, index: number) => (
									<div key={index} className="w-32 h-32 bg-neutral-400">
										<img
											src={image}
											className={`w-full h-full object-cover ${index === selectedImageIndex ? "border-4 border-brand-primary" : ""}`}
											onClick={() => setSelectedImageIndex(index)}
										/>
									</div>
								))}
								<label className="cursor-pointer w-32 h-32 bg-neutral-400">
									<input type="file" className="hidden" onChange={onAddImage} />
								</label>
							</div>
						</div>
					</div>
					<div className="w-[512px] self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
						<div className="self-stretch flex flex-col justify-start items-start gap-8">
							<div className="flex flex-col justify-start items-start gap-2">
								<div className="inline-flex justify-center items-end gap-1">
									<input
										value={startPrice}
										onChange={(e) => setStartPrice(e.target.value)}
										type="number"
										className="w-64 justify-start text-brand-primary text-8xl font-bold font-['Inter']"
									/>
									<div className="justify-start text-brand-primary text-6xl font-bold font-['Inter']">zł</div>
								</div>
							</div>
						</div>
						<div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
						<div className="flex-col self-stretch text-2xl font-semibold text-orange-600">
							Początek aukcji:
							<input type="datetime-local" className="mb-4 p-2 border border-gray-300 rounded-md text-black font-normal" />
							Koniec aukcji:
							<input type="datetime-local" className="mb-4 p-2 border border-gray-300 rounded-md text-black font-normal" />
						</div>
							<div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
							<Button label="Utwórz aukcję" onClick={() => {}} size="large" />
					</div>
				</div>
				<div className="self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 flex flex-col justify-start items-start gap-4 overflow-hidden">
					<div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">Opis</div>
					<div className="self-stretch justify-start">
						<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="flex flex-1 min-h-128 p-2" placeholder="Opis produktu..." />
						<div className="flex-1 p-2 markdown flex-col">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
