import { useRouter } from "next/navigation";

export const AuctionCard = ({ product }: { product: { id: string; name: string; price: number; imageUrl: string; time: string; slug: string } }) => {
	const router = useRouter();
	return (
		<div
			className="flex-1 self-stretch p-4 bg-white inline-flex flex-col justify-start items-start gap-6 overflow-hidden cursor-pointer"
			onClick={() => {
				router.push(`/aukcja/${product.id}`);
			}}
		>
			<div className="self-stretch h-52 relative bg-neutral-400" />
			<div className="self-stretch flex flex-col justify-start items-start gap-2">
				<div className="self-stretch flex flex-col justify-start items-start gap-2.5">
					<div className="self-stretch flex flex-col justify-start items-start gap-2.5">
						<div className="inline-flex justify-center items-end gap-1">
							<div className="justify-start text-brand-primary text-4xl font-bold font-['Inter']">{product.price}</div>
							<div className="justify-start text-brand-primary text-2xl font-bold font-['Inter']">zł</div>
						</div>
						<div className="self-stretch inline-flex justify-center items-center gap-2.5">
							<div className="flex-1 justify-start text-black text-xl font-normal font-['Inter']">{product.name}</div>
						</div>
					</div>
				</div>
			</div>
			<div className="self-stretch flex-1 justify-start items-end text-black text-xl font-bold font-['Inter']">{product.time}</div>
		</div>
	);
};
