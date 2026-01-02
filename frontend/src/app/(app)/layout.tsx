"use client";

import Header from "@/components/structure/Header";
import store from "@/store/store";
import { Provider } from "react-redux";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex-col">
			<Provider store={store}>
				<Header />
				{children}
			</Provider>
		</div>
	);
}
