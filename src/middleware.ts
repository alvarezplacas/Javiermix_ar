import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const protocol = context.request.headers.get("x-forwarded-proto");
  const host = context.request.headers.get("x-forwarded-host") || context.request.headers.get("host") || context.url.host;

  console.log(`[Middleware Debug] URL: ${context.url.toString()}`);
  console.log(`[Middleware Debug] Headers - x-forwarded-proto: ${protocol}, x-forwarded-host: ${context.request.headers.get("x-forwarded-host")}, host: ${context.request.headers.get("host")}`);
  console.log(`[Middleware Debug] Resolved Host: ${host}`);

  // Redirigir a HTTPS solo si se detecta explícitamente HTTP y tenemos un host válido (que no contenga null ni undefined)
  const isHostInvalid = !host || host.includes("null") || host.includes("undefined") || host.trim() === "";
  if (protocol === "http" && !isHostInvalid && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    const redirectUrl = `https://${host}${context.url.pathname}${context.url.search}`;
    console.log(`[Middleware Debug] Redirecting to: ${redirectUrl}`);
    return context.redirect(redirectUrl, 301);
  }

  // Redirigir noirandlux.com a la revista (ya que index es el portfolio de javiermix)
  if (host && host.includes("noirandlux.com") && context.url.pathname === "/") {
    return context.redirect(`https://${host}/revista/`, 301);
  }

  return next();
});

