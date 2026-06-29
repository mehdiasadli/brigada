import { createEvlog } from "evlog/next";
import { createInstrumentation } from "evlog/next/instrumentation/create";

export const { withEvlog, useLogger, log, createError } = createEvlog({
	service: "__SERVICE_NAME__",
});

export const { register, onRequestError } = createInstrumentation({
	service: "__SERVICE_NAME__",
});
