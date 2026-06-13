-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('GENERATED', 'UPLOADED', 'SCANNED');

-- CreateTable
CREATE TABLE "TransportationRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "route" TEXT,
    "customerCompany" TEXT,
    "carrierCompany" TEXT,
    "vehicleDetails" TEXT,
    "cargoDetails" TEXT,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TransportationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportationDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "extension" TEXT,
    "storageKey" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "source" "DocumentSource" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transportationRecordId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TransportationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedDocumentLink" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "documentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "SharedDocumentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransportationRecord_createdById_idx" ON "TransportationRecord"("createdById");

-- CreateIndex
CREATE INDEX "TransportationRecord_route_idx" ON "TransportationRecord"("route");

-- CreateIndex
CREATE INDEX "TransportationRecord_customerCompany_idx" ON "TransportationRecord"("customerCompany");

-- CreateIndex
CREATE INDEX "TransportationRecord_carrierCompany_idx" ON "TransportationRecord"("carrierCompany");

-- CreateIndex
CREATE INDEX "TransportationRecord_updatedAt_idx" ON "TransportationRecord"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TransportationDocument_storageKey_key" ON "TransportationDocument"("storageKey");

-- CreateIndex
CREATE INDEX "TransportationDocument_transportationRecordId_idx" ON "TransportationDocument"("transportationRecordId");

-- CreateIndex
CREATE INDEX "TransportationDocument_createdById_idx" ON "TransportationDocument"("createdById");

-- CreateIndex
CREATE INDEX "TransportationDocument_documentType_idx" ON "TransportationDocument"("documentType");

-- CreateIndex
CREATE INDEX "TransportationDocument_source_idx" ON "TransportationDocument"("source");

-- CreateIndex
CREATE INDEX "TransportationDocument_createdAt_idx" ON "TransportationDocument"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SharedDocumentLink_tokenHash_key" ON "SharedDocumentLink"("tokenHash");

-- CreateIndex
CREATE INDEX "SharedDocumentLink_documentId_idx" ON "SharedDocumentLink"("documentId");

-- CreateIndex
CREATE INDEX "SharedDocumentLink_createdById_idx" ON "SharedDocumentLink"("createdById");

-- CreateIndex
CREATE INDEX "SharedDocumentLink_isActive_idx" ON "SharedDocumentLink"("isActive");

-- AddForeignKey
ALTER TABLE "TransportationRecord" ADD CONSTRAINT "TransportationRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationDocument" ADD CONSTRAINT "TransportationDocument_transportationRecordId_fkey" FOREIGN KEY ("transportationRecordId") REFERENCES "TransportationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationDocument" ADD CONSTRAINT "TransportationDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocumentLink" ADD CONSTRAINT "SharedDocumentLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TransportationDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocumentLink" ADD CONSTRAINT "SharedDocumentLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
