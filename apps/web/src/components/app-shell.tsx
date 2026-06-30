"use client";

import { HeaderBrand, type HeaderNavItem } from "@brigada/ui/components/header";
import { Shell } from "@brigada/ui/components/shell";

const links: HeaderNavItem[] = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/about" },
	{
		label: "People",
		items: [
			{ label: "Members", href: "/people" },
			{ label: "Roles", href: "/people/roles" },
		],
	},
	{ label: "Contact", href: "/contact" },
];

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<Shell
			links={links}
			brand={<HeaderBrand href="/">brigada/web</HeaderBrand>}
		>
			{children}
		</Shell>
	);
}
