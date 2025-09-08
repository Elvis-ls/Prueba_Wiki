-- CreateTable
CREATE TABLE "PasswordResetTokenAdmin" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetTokenAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetTokenAdmin_token_key" ON "PasswordResetTokenAdmin"("token");

-- AddForeignKey
ALTER TABLE "PasswordResetTokenAdmin" ADD CONSTRAINT "PasswordResetTokenAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
