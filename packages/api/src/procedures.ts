import { ORPCError } from "@orpc/server";

import { o } from "./o";

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	const userId = context.session.user.id;

	return next({
		context: {
			session: context.session,
			userId,
		},
	});
});

export const publicProcedure = o;

export const protectedProcedure = publicProcedure.use(requireAuth);
