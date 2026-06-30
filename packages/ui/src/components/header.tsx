"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@brigada/ui/components/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@brigada/ui/components/sheet";
import { cn } from "@brigada/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

// --- Link config -------------------------------------------------------

export type HeaderNavLeaf = {
	label: ReactNode;
	href: string;
	/** Override the default exact-pathname match. */
	match?: (pathname: string) => boolean;
};

export type HeaderNavGroup = {
	label: ReactNode;
	items: HeaderNavLeaf[];
};

export type HeaderNavItem = HeaderNavLeaf | HeaderNavGroup;

function isGroup(item: HeaderNavItem): item is HeaderNavGroup {
	return "items" in item;
}

function isActive(leaf: HeaderNavLeaf, pathname: string): boolean {
	if (leaf.match) return leaf.match(pathname);
	return pathname === leaf.href;
}

function groupHasActive(group: HeaderNavGroup, pathname: string): boolean {
	return group.items.some((item) => isActive(item, pathname));
}

// --- Brand (utility link) ----------------------------------------------

const brandClasses =
	"inline-flex items-center font-medium text-foreground text-sm tracking-tight outline-none transition-colors hover:text-muted-foreground focus-visible:text-muted-foreground";

interface HeaderBrandProps extends ComponentProps<typeof Link> {}

export function HeaderBrand({ className, ...props }: HeaderBrandProps) {
	return (
		<Link
			data-slot="header-brand"
			className={cn(brandClasses, className)}
			{...props}
		/>
	);
}

// --- Nav link styling (shared) -----------------------------------------

const navLinkClasses = cva(
	"relative inline-flex h-12 items-center gap-1 px-2 font-medium text-xs outline-none transition-colors",
	{
		variants: {
			active: {
				true: "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground",
				false:
					"text-muted-foreground hover:text-foreground focus-visible:text-foreground",
			},
		},
		defaultVariants: { active: false },
	},
);

export const headerNavLinkVariants = navLinkClasses;
export type HeaderNavLinkVariants = VariantProps<typeof navLinkClasses>;

// --- Root --------------------------------------------------------------

interface HeaderProps {
	brand?: ReactNode;
	links?: HeaderNavItem[];
	actions?: ReactNode;
	className?: string;
}

export function Header({ brand, links, actions, className }: HeaderProps) {
	const hasLinks = Boolean(links && links.length > 0);
	return (
		<header
			data-slot="header"
			className={cn(
				"sticky top-0 z-40 w-full border-border border-b bg-background",
				className,
			)}
		>
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
				<HeaderLeft brand={brand} links={links} hasLinks={hasLinks} />
				<HeaderRight actions={actions} links={links} hasLinks={hasLinks} />
			</div>
		</header>
	);
}

function HeaderLeft({
	brand,
	links,
	hasLinks,
}: {
	brand: ReactNode;
	links: HeaderNavItem[] | undefined;
	hasLinks: boolean;
}) {
	if (!brand && !hasLinks) {
		// Keep an empty placeholder so flex justify-between still works.
		return <div />;
	}
	return (
		<div className="flex min-w-0 items-center gap-4">
			{brand}
			{hasLinks && <DesktopNav links={links as HeaderNavItem[]} />}
		</div>
	);
}

function HeaderRight({
	actions,
	links,
	hasLinks,
}: {
	actions: ReactNode;
	links: HeaderNavItem[] | undefined;
	hasLinks: boolean;
}) {
	if (!actions && !hasLinks) {
		return <div />;
	}
	return (
		<div className="flex items-center gap-1.5">
			{actions}
			{hasLinks && <MobileMenu links={links as HeaderNavItem[]} />}
		</div>
	);
}

// --- Desktop -----------------------------------------------------------

function DesktopNav({ links }: { links: HeaderNavItem[] }) {
	const pathname = usePathname() ?? "";
	return (
		<nav data-slot="header-nav" className="hidden items-center md:flex">
			{links.map((item, i) =>
				isGroup(item) ? (
					<DesktopGroup
						key={`g-${i}-${typeof item.label === "string" ? item.label : i}`}
						group={item}
						pathname={pathname}
					/>
				) : (
					<Link
						key={item.href}
						href={item.href}
						className={navLinkClasses({
							active: isActive(item, pathname),
						})}
					>
						{item.label}
					</Link>
				),
			)}
		</nav>
	);
}

function DesktopGroup({
	group,
	pathname,
}: {
	group: HeaderNavGroup;
	pathname: string;
}) {
	const active = groupHasActive(group, pathname);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					navLinkClasses({ active }),
					"data-popup-open:text-foreground",
				)}
			>
				{group.label}
				<ChevronDownIcon className="size-3" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" sideOffset={0}>
				{group.items.map((item) => (
					<DropdownMenuItem
						key={item.href}
						render={<Link href={item.href} />}
						data-active={isActive(item, pathname) ? "" : undefined}
						className="data-[active]:font-medium data-[active]:text-foreground"
					>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// --- Mobile (bottom sheet) ---------------------------------------------

function MobileMenu({ links }: { links: HeaderNavItem[] }) {
	const pathname = usePathname() ?? "";
	return (
		<Sheet>
			<SheetTrigger
				className="inline-flex size-8 items-center justify-center text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground md:hidden"
				aria-label="Open menu"
			>
				<MenuIcon className="size-4" />
			</SheetTrigger>
			<SheetContent side="bottom" className="md:hidden" hideClose>
				<nav className="flex flex-1 flex-col overflow-y-auto py-1">
					{links.map((item, i) =>
						isGroup(item) ? (
							<MobileGroup
								key={`g-${i}-${typeof item.label === "string" ? item.label : i}`}
								group={item}
								pathname={pathname}
							/>
						) : (
							<MobileLink
								key={item.href}
								leaf={item}
								active={isActive(item, pathname)}
							/>
						),
					)}
				</nav>
			</SheetContent>
		</Sheet>
	);
}

const mobileLinkClasses = cva(
	"flex items-center border-l-2 px-4 py-3 text-sm outline-none transition-colors",
	{
		variants: {
			active: {
				true: "border-foreground font-medium text-foreground",
				false:
					"border-transparent text-muted-foreground hover:text-foreground focus-visible:text-foreground",
			},
		},
		defaultVariants: { active: false },
	},
);

function MobileLink({
	leaf,
	active,
}: {
	leaf: HeaderNavLeaf;
	active: boolean;
}) {
	return (
		<Link href={leaf.href} className={mobileLinkClasses({ active })}>
			{leaf.label}
		</Link>
	);
}

function MobileGroup({
	group,
	pathname,
}: {
	group: HeaderNavGroup;
	pathname: string;
}) {
	return (
		<div data-slot="header-mobile-group" className="flex flex-col">
			<div className="px-4 pt-4 pb-1 text-muted-foreground text-xs uppercase tracking-wide">
				{group.label}
			</div>
			{group.items.map((item) => (
				<MobileLink
					key={item.href}
					leaf={item}
					active={isActive(item, pathname)}
				/>
			))}
		</div>
	);
}
