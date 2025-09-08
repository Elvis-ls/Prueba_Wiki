-- CreateTable
CREATE TABLE "FinancialBalance" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalShareholderContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isContributionsOverridden" BOOLEAN NOT NULL DEFAULT false,
    "totalCreditIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCreditIncomeOverridden" BOOLEAN NOT NULL DEFAULT false,
    "lastModifiedAt" TIMESTAMP(3),
    "lastModifiedById" INTEGER,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialBalance_year_idx" ON "FinancialBalance"("year");

-- CreateIndex
CREATE INDEX "FinancialBalance_year_month_idx" ON "FinancialBalance"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialBalance_year_month_key" ON "FinancialBalance"("year", "month");
