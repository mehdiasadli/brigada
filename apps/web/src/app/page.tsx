export default function Home() {
	return (
		<div>
			<h1 className="font-medium text-foreground text-lg">Home</h1>
			<p className="mt-2 text-muted-foreground text-sm">
				Resize the window to see the mobile layout (below md). Click the
				hamburger to open the bottom sheet.
			</p>
			<div className="h-[200vh]" />
		</div>
	);
}
