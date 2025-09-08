-- CreateTable
CREATE TABLE "Asamblea" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "agenda" TEXT[],
    "documentos" TEXT[],
    "requisitos" TEXT[],
    "contacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asamblea_pkey" PRIMARY KEY ("id")
);
