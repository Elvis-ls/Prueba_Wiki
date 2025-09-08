-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "addressHome" TEXT,
    "areaPosition" TEXT,
    "institutionLevel" TEXT,
    "location" TEXT,
    "fingerprintCode" TEXT,
    "ultimosDigitosCarnet" TEXT,
    "image" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "status" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Accionista',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareholderFormulario" (
    "numeroDocumento" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "tituloProfesional" TEXT NOT NULL,
    "nombreUniversidad" TEXT,
    "descripcionProfesional" TEXT,
    "numeroTelefono" TEXT NOT NULL,
    "codigoPais" TEXT,
    "discapacidad" TEXT NOT NULL,
    "tipodiscapacidad" TEXT,
    "descripcionDiscapacidad" TEXT,
    "fechaNacimiento" TEXT NOT NULL,
    "fechaSolicitud" TEXT NOT NULL,
    "fechaEmision" TEXT NOT NULL,
    "montoInversion" DOUBLE PRECISION NOT NULL,
    "comprobantePago" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "tipo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareholderFormulario_pkey" PRIMARY KEY ("numeroDocumento")
);

-- CreateTable
CREATE TABLE "CreditForm" (
    "numeroDocumento" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "tituloProfesional" TEXT NOT NULL,
    "nombreUniversidad" TEXT,
    "descripcionProfesional" TEXT,
    "numeroTelefono" TEXT NOT NULL,
    "codigoPais" TEXT,
    "discapacidad" TEXT NOT NULL,
    "tipodiscapacidad" TEXT,
    "descripcionDiscapacidad" TEXT,
    "fechaEmision" TEXT NOT NULL,
    "montoCredito" DOUBLE PRECISION NOT NULL,
    "tipodeCredito" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditForm_pkey" PRIMARY KEY ("numeroDocumento")
);

-- CreateTable
CREATE TABLE "Guarantor" (
    "id" SERIAL NOT NULL,
    "nombresGarante" TEXT NOT NULL,
    "apellidosGarante" TEXT NOT NULL,
    "whatsappGarante" TEXT NOT NULL,
    "solicitudId" INTEGER NOT NULL,

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CreditoAccionistas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CreditoAccionistas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cedula_key" ON "users"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "users_accountNumber_key" ON "users"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_fingerprintCode_key" ON "users"("fingerprintCode");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "CreditForm_cedula_idx" ON "CreditForm"("cedula");

-- CreateIndex
CREATE INDEX "CreditForm_fechaEmision_idx" ON "CreditForm"("fechaEmision");

-- CreateIndex
CREATE INDEX "CreditForm_tipodeCredito_idx" ON "CreditForm"("tipodeCredito");

-- CreateIndex
CREATE INDEX "_CreditoAccionistas_B_index" ON "_CreditoAccionistas"("B");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "CreditForm"("numeroDocumento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CreditoAccionistas" ADD CONSTRAINT "_CreditoAccionistas_A_fkey" FOREIGN KEY ("A") REFERENCES "CreditForm"("numeroDocumento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CreditoAccionistas" ADD CONSTRAINT "_CreditoAccionistas_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
