import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const protocol = context.request.headers.get("x-forwarded-proto") || "http";
  const host = context.request.headers.get("host");

  // Si detectamos que la petición viene por HTTP a través del proxy, redirigimos a HTTPS
  if (protocol === "http" && !host?.includes("localhost") && !host?.includes("127.0.0.1")) {
    return context.redirect(`https://${host}${context.url.pathname}${context.url.search}`, 301);
  }

  return next();
});
