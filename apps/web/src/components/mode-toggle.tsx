"use client";

import { Button } from "@brigada/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const Icon = theme === "light" ? Sun : Moon;
	const nextTheme = theme === "light" ? "dark" : "light";

	const toggleTheme = () => {
		setTheme(nextTheme);
	};

	return (
		<Button variant="outline" size="icon" onClick={toggleTheme}>
			<Icon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
