import { z } from "zod";

export const demoFocuses = ["Student workspace", "College partnerships", "Alumni network"] as const;
export const demoTimes = ["10:00", "12:00", "15:00", "17:00"] as const;

export const demoRequestSchema = z.object({
  focus: z.enum(demoFocuses),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date.").refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Choose a valid date."),
  time: z.enum(demoTimes),
  duration: z.number().int().min(15).max(45).multipleOf(15),
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  organisation: z.string().trim().max(150),
});

export type DemoRequest = z.infer<typeof demoRequestSchema>;

export function createDemoMailto(input: DemoRequest) {
  const data = demoRequestSchema.parse(input);
  const body = [
    "I'd like to request a Tier2X product demo.",
    `Focus: ${data.focus}`,
    `Preferred date: ${data.date}`,
    `Preferred time: ${data.time} IST (UTC+05:30)`,
    `Duration: ${data.duration} minutes`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `College / organisation: ${data.organisation || "Not specified"}`,
    "Please confirm availability before scheduling.",
  ].join("\n");
  return `mailto:campusx4@gmail.com?subject=${encodeURIComponent(`Tier2X demo request — ${data.focus}`)}&body=${encodeURIComponent(body)}`;
}