import * as z from "zod";

export const formSchemas = {
  1: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  }),
  2: z.object({
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  3: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
  }),
};
