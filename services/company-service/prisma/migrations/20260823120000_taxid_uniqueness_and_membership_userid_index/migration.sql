-- CreateIndex
-- Soporta "en qué empresas participa este usuario" sin escanear toda la tabla.
CREATE INDEX "CompanyMembership_userId_idx" ON "CompanyMembership"("userId");

-- AddUniqueConstraint
-- Dos empresas no pueden compartir NIT/taxId dentro del mismo país. NULLs no
-- colisionan entre sí en Postgres, así que las empresas sin taxId no se ven
-- afectadas por esta restricción.
--
-- NOTA DE DESPLIEGUE: si ya existen filas duplicadas de (country, taxId) en
-- producción, este ALTER TABLE fallará. Antes de aplicar en un entorno con
-- datos reales, correr:
--   SELECT country, "taxId", COUNT(*) FROM "Company"
--   WHERE "taxId" IS NOT NULL GROUP BY country, "taxId" HAVING COUNT(*) > 1;
-- y resolver los duplicados manualmente.
CREATE UNIQUE INDEX "Company_country_taxId_key" ON "Company"("country", "taxId");
