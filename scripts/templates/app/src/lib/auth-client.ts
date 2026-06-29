import type { auth } from "@brigada/auth";
import { env } from "@brigada/env/__APP_NAME__";
import {
	inferAdditionalFields,
	multiSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_SERVER_URL,
	plugins: [inferAdditionalFields<typeof auth>(), multiSessionClient()],
});
