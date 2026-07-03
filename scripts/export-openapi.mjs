#!/usr/bin/env node
/**
 * Exporta a disco (docs/openapi/<servicio>.json) el spec OpenAPI que cada
 * microservicio expone en `/docs-json` cuando corre en modo desarrollo
 * (ver shared/swagger/swagger.setup.ts).
 *
 * Requiere que los servicios estén corriendo en NODE_ENV=development,
 * por ejemplo con `pnpm dev` (docker compose) o `pnpm dev:auth`, etc.
 *
 * Uso:
 *   node scripts/export-openapi.mjs
 *   node scripts/export-openapi.mjs auth-service
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs', 'openapi');

const SERVICES = [
  { name: 'api-gateway', port: 3000 },
  { name: 'auth-service', port: 3001 },
  { name: 'config-service', port: 3002 },
  { name: 'notification-service', port: 3003 },
];

async function exportOne(service) {
  const url = `http://localhost:${service.port}/docs-json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.warn(`⚠️  ${service.name}: HTTP ${res.status} en ${url}`);
      return false;
    }
    const spec = await res.json();
    const outFile = path.join(outDir, `${service.name}.json`);
    await writeFile(outFile, JSON.stringify(spec, null, 2) + '\n', 'utf-8');
    console.log(`✅ ${service.name} -> docs/openapi/${service.name}.json`);
    return true;
  } catch (err) {
    console.warn(
      `⚠️  ${service.name}: no responde en ${url} (¿está corriendo en modo development? ver services/${service.name}/README.md). ${err.message}`,
    );
    return false;
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const requested = process.argv[2];
  const targets = requested ? SERVICES.filter((s) => s.name === requested) : SERVICES;

  if (requested && targets.length === 0) {
    console.error(`Servicio desconocido: ${requested}`);
    process.exit(1);
  }

  const results = await Promise.all(targets.map(exportOne));
  const failed = results.filter((ok) => !ok).length;

  if (failed > 0) {
    console.log(
      `\n${failed} servicio(s) no exportado(s). Levántalos con "pnpm dev" y vuelve a ejecutar este script.`,
    );
  }
}

main();
