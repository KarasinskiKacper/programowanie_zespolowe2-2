"use client";

import Footer from "@/components/structure/Footer";
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
				<div className="pt-24 flex-1 flex-col">
					{children}
				</div>
				<Footer />
			</Provider>
		</div>
	);
}
