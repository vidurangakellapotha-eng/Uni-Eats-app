import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'mock-vercel-api',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (req.url === '/api/reset-password' && req.method === 'POST') {
                try {
                    const chunk: any[] = [];
                    req.on('data', c => chunk.push(c));
                    req.on('end', async () => {
                        (req as any).body = JSON.parse(Buffer.concat(chunk).toString() || '{}');
                        (res as any).status = (code: number) => { res.statusCode = code; return res; };
                        (res as any).json = (data: any) => {
                           res.setHeader('Content-Type', 'application/json');
                           res.end(JSON.stringify(data));
                        };
                        const { default: handler } = await import('./api/reset-password.js');
                        await handler(req, res);
                    });
                } catch(e: any) {
                   res.statusCode=500; res.end(e.toString());
                }
                return;
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
