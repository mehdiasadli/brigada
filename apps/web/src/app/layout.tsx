import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { AppShell } from "@/components/app-shell";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "brigada",
	description: "brigada",
};

type RootLayoutProps = Readonly<{
	children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<body className="antialiased">
				<Providers>
					<AppShell>{children}</AppShell>
				</Providers>
			</body>
		</html>
	);
}
