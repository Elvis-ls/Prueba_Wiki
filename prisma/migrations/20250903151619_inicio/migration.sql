/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetTokenAdmin" DROP CONSTRAINT "PasswordResetTokenAdmin_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ShareholderFormulario" DROP CONSTRAINT "ShareholderFormulario_aprobadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "ShareholderFormulario" DROP CONSTRAINT "ShareholderFormulario_rechazadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "directiva_content" DROP CONSTRAINT "directiva_content_adminId_fkey";

-- DropForeignKey
ALTER TABLE "directiva_members" DROP CONSTRAINT "directiva_members_adminId_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "News";

-- CreateTable
CREATE TABLE "admin" (
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

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageSize" TEXT,
    "authorId" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_cedula_key" ON "admin"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accountNumber_key" ON "admin"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_fingerprintCode_key" ON "admin"("fingerprintCode");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directiva_content" ADD CONSTRAINT "directiva_content_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directiva_members" ADD CONSTRAINT "directiva_members_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetTokenAdmin" ADD CONSTRAINT "PasswordResetTokenAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareholderFormulario" ADD CONSTRAINT "ShareholderFormulario_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareholderFormulario" ADD CONSTRAINT "ShareholderFormulario_rechazadoPorId_fkey" FOREIGN KEY ("rechazadoPorId") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
