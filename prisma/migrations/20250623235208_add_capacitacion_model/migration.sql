-- CreateTable
CREATE TABLE "Capacitacion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "modalidad" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "tematica" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "agenda" TEXT[],
    "materiales" TEXT[],
    "requisitos" TEXT[],
    "contacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "enlace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capacitacion_pkey" PRIMARY KEY ("id")
);
