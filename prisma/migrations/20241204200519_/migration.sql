/*
  Warnings:

  - Added the required column `problemRevisionDate` to the `Submit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "accountDiscordId" TEXT NOT NULL,
    "accountAtcoderId" TEXT NOT NULL,
    "problemRevisionDate" TEXT NOT NULL,
    CONSTRAINT "Submit_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submit_accountDiscordId_accountAtcoderId_fkey" FOREIGN KEY ("accountDiscordId", "accountAtcoderId") REFERENCES "Account" ("discordId", "atcoderId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submit_problemRevisionDate_fkey" FOREIGN KEY ("problemRevisionDate") REFERENCES "ProblemRevision" ("date") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submit" ("accountAtcoderId", "accountDiscordId", "id", "problemId") SELECT "accountAtcoderId", "accountDiscordId", "id", "problemId" FROM "Submit";
DROP TABLE "Submit";
ALTER TABLE "new_Submit" RENAME TO "Submit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
