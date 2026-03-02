-- AlterTable: JournalEntry - voeg emotie/slider/factoren toe, maak content optioneel
ALTER TABLE "JournalEntry"
  ADD COLUMN "emotion" TEXT,
  ADD COLUMN "sliderValue" INTEGER,
  ADD COLUMN "factors" TEXT NOT NULL DEFAULT '[]';

ALTER TABLE "JournalEntry" ALTER COLUMN "content" DROP NOT NULL;
