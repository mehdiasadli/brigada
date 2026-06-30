"use client";
import { Header } from "@brigada/ui/components/header";
import { cn } from "@brigada/ui/lib/utils";

interface ShellProps extends React.ComponentProps<typeof Header> {
	children: React.ReactNode;
	containerClassName?: string;
	mainClassName?: string;
}

export function Shell({
	children,
	containerClassName,
	mainClassName,
	...props
}: ShellProps) {
	return (
		<div className={containerClassName}>
			<Header {...props} />
			<main
				className={cn("mx-auto max-w-7xl px-4 py-12 md:px-6", mainClassName)}
			>
				{children}
			</main>
		</div>
	);
}
