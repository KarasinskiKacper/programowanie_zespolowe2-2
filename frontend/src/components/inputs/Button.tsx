export function Button({ label, btnStyle = "filled", onClick, size }: { label: string; btnStyle?: "outline" | "filled"; onClick?: () => void; size?: "small" | "medium" | "large" }) {
	const sizeClasses = {
		small: "text-sm py-2 px-4",
		medium: "text-base py-3 px-6",
		large: "text-lg py-4 px-8",
	}[size || "medium"];
	const s = {
		outline:
			`self-stretch ${sizeClasses} bg-white outline outline-4 outline-offset-[-4px] outline-orange-600 inline-flex justify-center items-center gap-2.5 overflow-hidden text-brand-primary text-2xl font-bold font-['Inter'] cursor-pointer`,
		filled: `self-stretch ${sizeClasses} bg-orange-600 inline-flex justify-center items-center gap-2.5 overflow-hidden text-white text-2xl font-bold font-['Inter'] cursor-pointer`,
	}[btnStyle];

	return <div className={s} onClick={onClick}>{label}</div>;
}
	