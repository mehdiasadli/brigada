"use client";

import { ThemeProvider } from "@brigada/ui/components/providers/theme-provider";
import { Toaster } from "@brigada/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { queryClient } from "@/utils/orpc";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<NuqsAdapter>
				<QueryClientProvider client={queryClient}>
					{children}
					<ReactQueryDevtools />
				</QueryClientProvider>
				<Toaster richColors />
			</NuqsAdapter>
		</ThemeProvider>
	);
}
