export const TextInput = ({
	label,
	type = "text",
	placeholder,
	value,
	onChange,
	variant = "default",
}: {
	label: string;
	type?: string;
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	variant: "default" | "outline";
}) => {
	return (
		<div className="self-stretch flex flex-col justify-start items-start gap-2">
			<div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">{label}</div>
			<input type={type} className={`self-stretch h-12 relative bg-white outline-0 p-2 ${variant === "outline" ? "border-2 border-orange-600" : ""}`} placeholder={placeholder} value={value} onChange={onChange} />
		</div>
	);
};
