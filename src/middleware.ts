import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const protocol = context.request.headers.get("x-forwarded-proto");
  const host = context.request.headers.get("x-forwarded-host") || context.request.headers.get("host") || context.url.host;

  // Redirigir a HTTPS solo si se detecta explícitamente HTTP y tenemos un host válido
  if (protocol === "http" && host && host !== "null" && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return context.redirect(`https://${host}${context.url.pathname}${context.url.search}`, 301);
  }

  return next();
});
