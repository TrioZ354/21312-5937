import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";

const configured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM);
const attempts = new Map<string, number>();
const orderInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(254),
  quantity: z.union([z.number().int().min(1).max(5), z.literal("wholesale")]),
  message: z.string().trim().max(2000),
  consent: z.literal(true),
  website: z.string().max(200).default(""),
});

export const orders = {
  config: base.handler(() => ({ automaticEmail: configured() })),
  create: base.input(orderInput).handler(async ({ input, context }) => {
    if (input.website)
      throw new ORPCError("BAD_REQUEST", {
        message: "Не удалось обработать заявку.",
      });
    const subject = "Заявка на заказ — Перо Измерений";
    const quantityLabel =
      input.quantity === "wholesale"
        ? "Оптом — 6 и более экземпляров (количество уточнить)"
        : String(input.quantity);
    const text = `Перо Измерений: Вельд’Эран\n\nИмя: ${input.name}\nEmail: ${input.email}\nКоличество экземпляров: ${quantityLabel}\n\nКомментарий: ${input.message || "Без комментария"}\n\nОтправитель согласился на обработку данных для ответа на заявку.`;
    if (!configured())
      return {
        sent: false,
        mailto: `mailto:sales@trioz.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      };
    const id =
      context.headers.get("x-forwarded-for")?.split(",")[0] || input.email;
    const now = Date.now();
    if ((attempts.get(id) ?? 0) > now - 60_000)
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Подождите минуту перед повторной отправкой.",
      });
    attempts.set(id, now);
    if (attempts.size > 2000)
      for (const [key, time] of attempts)
        if (time < now - 60_000) attempts.delete(key);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.ORDER_EMAIL_FROM,
          to: ["sales@trioz.ru"],
          reply_to: input.email,
          subject,
          text,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error("Email provider rejected request");
      return { sent: true, mailto: null };
    } catch {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          "Не удалось отправить письмо. Напишите напрямую на sales@trioz.ru.",
      });
    }
  }),
};
