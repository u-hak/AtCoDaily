import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const lower = 214;
const upper = 382;

const prisma = new PrismaClient();

type ATCProblemResp = {
  id: string;
  contest_id: string;
  problem_index: string;
  name: string;
  title: string;
};

const resp = await fetch(
  "https://kenkoooo.com/atcoder/resources/problems.json",
);
const json = (await resp.json()) as ATCProblemResp[];

const isABCContest = (resp: ATCProblemResp) => {
  return resp.contest_id.startsWith("abc");
};

const isABCProblem = (resp: ATCProblemResp) => {
  return (
    resp.problem_index === "A" ||
    resp.problem_index === "B" ||
    resp.problem_index === "C"
  );
};

const isInRange = (resp: ATCProblemResp, start: number, end: number) => {
  const id = Number.parseInt(resp.contest_id.substring(3));
  return start <= id && id <= end;
};

const format = (resp: ATCProblemResp) => {
  return `https://atcoder.jp/contests/${resp.contest_id}/tasks/${resp.id}`;
};

const convertProblemIdx = (idx: string) => {
  if (idx === "A") {
    return 0;
  }

  if (idx === "B") {
    return 1;
  }

  if (idx === "C") {
    return 2;
  }

  return -1;
};

const formatToPrisma = (
  resp: ATCProblemResp,
): Prisma.ProblemCreateManyInput => {
  return {
    id: resp.id,
    url: format(resp),
    difficulty: convertProblemIdx(resp.problem_index),
  };
};

const problems = json
  .filter((p) => isABCProblem(p))
  .filter((p) => isInRange(p, lower, upper))
  .filter((p) => isABCContest(p))
  .map((p) => formatToPrisma(p));

await prisma.problem.createMany({
  data: problems,
});
