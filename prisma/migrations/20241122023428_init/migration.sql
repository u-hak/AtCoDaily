-- CreateTable
CREATE TABLE "Account" (
    "discordId" TEXT NOT NULL PRIMARY KEY,
    "atcoderId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Submit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "accountDiscordId" TEXT NOT NULL,
    "accountAtcoderId" TEXT NOT NULL,
    CONSTRAINT "Submit_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submit_accountDiscordId_accountAtcoderId_fkey" FOREIGN KEY ("accountDiscordId", "accountAtcoderId") REFERENCES "Account" ("discordId", "atcoderId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "times" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_atcoderId_key" ON "Account"("atcoderId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_discordId_atcoderId_key" ON "Account"("discordId", "atcoderId");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_url_key" ON "Problem"("url");
