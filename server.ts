import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Create Vite server in middleware mode.
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Example API route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Serve static assets from the 'public' directory
  app.use(express.static(path.resolve(__dirname, 'public')));

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
