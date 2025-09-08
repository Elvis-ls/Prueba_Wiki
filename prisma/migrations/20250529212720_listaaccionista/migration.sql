-- CreateTable
CREATE TABLE "AccionistaLista" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "porcentajeParticipacion" DOUBLE PRECISION NOT NULL,
    "cantidadAcciones" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccionistaLista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccionistaFollow" (
    "id" SERIAL NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followedId" INTEGER NOT NULL,
    "fechaSeguimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccionistaFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccionistaLista_userId_key" ON "AccionistaLista"("userId");

-- CreateIndex
CREATE INDEX "AccionistaLista_tipo_idx" ON "AccionistaLista"("tipo");

-- CreateIndex
CREATE INDEX "AccionistaLista_porcentajeParticipacion_idx" ON "AccionistaLista"("porcentajeParticipacion");

-- CreateIndex
CREATE INDEX "AccionistaLista_activo_idx" ON "AccionistaLista"("activo");

-- CreateIndex
CREATE INDEX "AccionistaFollow_followerId_idx" ON "AccionistaFollow"("followerId");

-- CreateIndex
CREATE INDEX "AccionistaFollow_followedId_idx" ON "AccionistaFollow"("followedId");

-- CreateIndex
CREATE UNIQUE INDEX "AccionistaFollow_followerId_followedId_key" ON "AccionistaFollow"("followerId", "followedId");

-- AddForeignKey
ALTER TABLE "AccionistaLista" ADD CONSTRAINT "AccionistaLista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccionistaFollow" ADD CONSTRAINT "AccionistaFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccionistaFollow" ADD CONSTRAINT "AccionistaFollow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
