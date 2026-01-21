import React from "react";

import Add from "@/components/icon/Add";
import Auctions from "@/components/icon/Auctions";
import Logo from "@/components/icon/Logo";
import Ring from "@/components/icon/Ring";
import RingInfo from "@/components/icon/RingInfo";
import User from "@/components/icon/User";
import Search from "@/components/icon/Search";
import Trash from "@/components/icon/Trash"

export const icons = {
	add: <Add />,
	auctions: <Auctions />,
	logo: <Logo />,
	ring: <Ring />,
	ringinfo: <RingInfo />,
	user: <User />,
	search: <Search />,
	trash: <Trash />
};

export default function Icon({ name, size = 32, color = "#fff", onClick = () => {}, className="" }: { className?:string, name: keyof typeof icons; size?: number; color?: string; onClick?: () => void }) {
	return (
		<div onClick={onClick} className={`cursor-pointer ` + className} style={{ color: color }}>
			{React.cloneElement(icons[name], { size, color })}
		</div>
	);
}
