-- CreateTable
CREATE TABLE "directiva_content" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "institutionalTitle" TEXT NOT NULL,
    "institutionalContent" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "directiva_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directiva_members" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "href" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "directiva_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "directiva_content" ADD CONSTRAINT "directiva_content_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directiva_members" ADD CONSTRAINT "directiva_members_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
