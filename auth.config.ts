import Google from '@auth/core/providers/google';
import { defineConfig } from 'auth-astro';

export default defineConfig({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                // Sincronización automática con Directus al iniciar sesión
                const directusUrl = process.env.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
                const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
                
                if (!adminToken) return true; // Fail gracefully si no hay token (solo modo dev)

                const email = user.email;
                if (!email) return false;

                // 1. Buscar si el usuario existe
                const res = await fetch(`${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                
                const data = await res.json();
                
                // 2. Si no existe, lo creamos
                if (data.data && data.data.length === 0) {
                    const newUser = {
                        first_name: user.name?.split(' ')[0] || '',
                        last_name: user.name?.split(' ').slice(1).join(' ') || '',
                        email: user.email,
                        provider: 'google',
                        external_identifier: user.id
                    };
                    
                    await fetch(`${directusUrl}/users`, {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${adminToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newUser)
                    });
                }
                
                return true;
            } catch (e) {
                console.error("[Auth] Error sync user to directus:", e);
                return true; // Permitimos el login local aunque falle directus
            }
        },
        async session({ session, token }) {
            // Pasamos el ID o info al cliente si es necesario
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        }
    }
});
