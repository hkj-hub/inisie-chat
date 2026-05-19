import type { z } from "zod";
import type { chatEntrySchema } from "../schemas/chatSchema.js";

export type ChatEntry = z.infer<typeof chatEntrySchema>;

export type LogEntry = ChatEntry;
