-- AlterTable
ALTER TABLE "ShareholderFormulario" ADD COLUMN     "aprobadoPorId" INTEGER,
ADD COLUMN     "comentariosRechazo" TEXT,
ADD COLUMN     "rechazadoPorId" INTEGER,
ADD COLUMN     "revisadoEn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "names" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "description" TEXT,
    "addressHome" TEXT,
    "areaPosition" TEXT,
    "institutionLevel" TEXT,
    "location" TEXT,
    "fingerprintCode" TEXT,
    "ultimosDigitosCarnet" TEXT,
    "image" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'Administrador',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageSize" TEXT,
    "fullContent" TEXT NOT NULL,
    "fullImageUrl" TEXT,
    "authorId" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_cedula_key" ON "Admin"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_accountNumber_key" ON "Admin"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_fingerprintCode_key" ON "Admin"("fingerprintCode");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareholderFormulario" ADD CONSTRAINT "ShareholderFormulario_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareholderFormulario" ADD CONSTRAINT "ShareholderFormulario_rechazadoPorId_fkey" FOREIGN KEY ("rechazadoPorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
