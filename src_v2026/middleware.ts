import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
    const url = new URL(context.request.url);
    
    // Proteger únicamente el subdirectorio del panel
    if (url.pathname.startsWith('/admin')) {
        // Permitir la ruta de login
        if (url.pathname === '/admin/login') {
            return next();
        }
        
        // Verificar firma criptográfica simple o token de sesión en cookies
        const sessionCookie = context.cookies.get('admin_jhm_session');
        if (!sessionCookie || sessionCookie.value !== 'authenticated_jhm_master') {
            // Expulsar a login
            return context.redirect('/admin/login');
        }
    }
    
    return next();
});
