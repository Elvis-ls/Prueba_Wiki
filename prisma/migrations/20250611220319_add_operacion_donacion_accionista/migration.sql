-- CreateTable
CREATE TABLE "Donacion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "causa" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mensaje" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "fechaDonacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
