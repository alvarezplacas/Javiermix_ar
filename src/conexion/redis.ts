import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🚀 Redis Connector (Singleton)
 * 
 * Este módulo maneja la conexión ultra-rápida a la capa de caché.
 * Implementa una lógica de redundancia para entornos locales y producción.
 */
class RedisConnector {
    private static instance: Redis | null = null;
    private static isInitialized = false;

    private constructor() {}

    public static getInstance(): Redis {
        if (!this.isInitialized) {
            const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
            const localUrl = process.env.LOCAL_REDIS_URL || 'redis://localhost:6379';

            console.log(`📡 Intentando conectar a Redis: ${redisUrl}...`);

            try {
                this.instance = new Redis(redisUrl, {
                    maxRetriesPerRequest: 1,
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    }
                });

                this.instance.on('error', (err) => {
                    if (err.code === 'ECONNREFUSED' && redisUrl !== localUrl) {
                        console.warn('⚠️ Fallo conexión Redis interna. Conmutando a Local...');
                        this.instance = new Redis(localUrl);
                    } else {
                        console.error('❌ Error crítico de Redis:', err.message);
                    }
                });

                this.instance.on('connect', () => {
                    console.log('✅ Redis conectado y listo.');
                });

                this.isInitialized = true;
            } catch (error) {
                console.error('❌ No se pudo inicializar el cliente Redis:', error);
                // Fallback a un objeto dummy si fallara catastróficamente (para evitar romper SSR)
                this.instance = new Redis(localUrl);
            }
        }

        return this.instance!;
    }
}

export const REDIS = RedisConnector.getInstance();
