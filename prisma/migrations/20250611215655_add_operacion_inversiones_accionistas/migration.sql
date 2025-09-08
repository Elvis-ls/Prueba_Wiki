-- CreateTable
CREATE TABLE "Inversion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "origen" TEXT NOT NULL,
    "rentabilidad" DOUBLE PRECISION,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "comprobanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inversion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inversion" ADD CONSTRAINT "Inversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
