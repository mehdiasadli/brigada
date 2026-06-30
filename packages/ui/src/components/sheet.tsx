"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@brigada/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetBackdrop({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="sheet-backdrop"
			className={cn(
				"data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50 fill-mode-forwards duration-300 data-closed:animate-out data-open:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

const sheetVariants = cva(
	"fixed z-50 flex flex-col gap-0 bg-background outline-none duration-300 data-closed:animate-out data-open:animate-in",
	{
		variants: {
			side: {
				right:
					"data-closed:slide-out-to-right data-open:slide-in-from-right inset-y-0 right-0 h-full w-3/4 max-w-sm border-border border-l",
				left: "data-closed:slide-out-to-left data-open:slide-in-from-left inset-y-0 left-0 h-full w-3/4 max-w-sm border-border border-r",
				top: "data-closed:slide-out-to-top data-open:slide-in-from-top inset-x-0 top-0 max-h-3/4 border-border border-b",
				bottom:
					"data-closed:slide-out-to-bottom data-open:slide-in-from-bottom inset-x-0 bottom-0 max-h-3/4 border-border border-t",
			},
		},
		defaultVariants: { side: "right" },
	},
);

interface SheetContentProps
	extends DialogPrimitive.Popup.Props,
		VariantProps<typeof sheetVariants> {
	hideClose?: boolean;
}

function SheetContent({
	className,
	side,
	hideClose,
	children,
	...props
}: SheetContentProps) {
	return (
		<SheetPortal>
			<SheetBackdrop />
			<DialogPrimitive.Popup
				data-slot="sheet-content"
				className={cn(sheetVariants({ side }), className)}
				{...props}
			>
				{children}
				{!hideClose && (
					<DialogPrimitive.Close
						data-slot="sheet-close-x"
						className="absolute top-3 right-3 inline-flex size-7 items-center justify-center text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
					>
						<XIcon className="size-4" />
						<span className="sr-only">Close</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn(
				"flex flex-col gap-1 border-border border-b px-4 py-3",
				className,
			)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn(
				"mt-auto flex flex-col gap-2 border-border border-t px-4 py-3",
				className,
			)}
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="sheet-title"
			className={cn(
				"font-medium text-foreground text-sm tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetBackdrop,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
};
