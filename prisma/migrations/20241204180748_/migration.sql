-- CreateTable
CREATE TABLE "ProblemRevision" (
    "date" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "_ProblemToProblemRevision" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProblemToProblemRevision_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProblemToProblemRevision_B_fkey" FOREIGN KEY ("B") REFERENCES "ProblemRevision" ("date") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemToProblemRevision_AB_unique" ON "_ProblemToProblemRevision"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemToProblemRevision_B_index" ON "_ProblemToProblemRevision"("B");
