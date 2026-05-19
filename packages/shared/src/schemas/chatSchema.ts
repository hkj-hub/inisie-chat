import { z } from "zod";

const CHAT_COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "crimson",
  "coral",
  "salmon",
  "tomato",
  "chocolate",
  "goldenrod",
  "olive",
  "teal",
  "cyan",
  "turquoise",
  "navy",
  "indigo",
  "violet",
  "magenta",
  "maroon",
  "lime",
  "aqua",
  "silver",
  "darkgreen",
  "darkblue",
  "hotpink",
] as const;

export const chatColorSchema = z.enum(CHAT_COLORS);

export const chatEntrySchema = z.object({
  timestamp: z.string().datetime(),
  name: z.string().min(1).max(50),
  color: chatColorSchema,
  message: z.string().min(1).max(500),
});

export const postChatBodySchema = z.object({
  name: z.string().min(1).max(50),
  color: chatColorSchema,
  message: z.string().min(1).max(500),
});
