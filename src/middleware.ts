import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    // Solo protegemos las rutas que empiecen con /admin
    if (context.url.pathname.startsWith('/admin')) {
        const adminSession = context.cookies.get('admin_session');

        // Permitir acceso a la página de login si no hay sesión
        if (context.url.pathname === '/admin/login') {
            return next();
        }

        if (!adminSession || adminSession.value !== 'active') {
            return context.redirect('/admin/login');
        }
    }

    return next();
});
