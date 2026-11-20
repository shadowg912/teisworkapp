import { buildApp } from './app';

// Cargar variables de entorno desde .env
import('dotenv').then(({ config }) => config());

const PORT = Number(process.env.PORT || 3333);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Servidor escuchando en http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
