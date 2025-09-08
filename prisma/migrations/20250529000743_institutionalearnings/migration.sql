-- CreateTable
CREATE TABLE "InstitutionalEarnings" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "intereses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otrosIngresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interesesModified" BOOLEAN NOT NULL DEFAULT false,
    "creditosModified" BOOLEAN NOT NULL DEFAULT false,
    "otrosModified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastModifiedAt" TIMESTAMP(3),

    CONSTRAINT "InstitutionalEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstitutionalEarnings_year_idx" ON "InstitutionalEarnings"("year");

-- CreateIndex
CREATE INDEX "InstitutionalEarnings_year_month_idx" ON "InstitutionalEarnings"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionalEarnings_year_month_key" ON "InstitutionalEarnings"("year", "month");
