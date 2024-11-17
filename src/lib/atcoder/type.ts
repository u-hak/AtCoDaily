import type { TupleFromInterface } from "../utilType.ts";

export interface AtCoderTask {
  difficulty: string;
  id: string;
  name: string;
}

export const AtCoderTask = {
  new(arg: AtCoderTask) {
    return { ...arg };
  },
};

export interface AtCoderSubmission {
  date: Date;
  task: AtCoderTask;
  status: "RE" | "TLE" | "WA" | "AC";
}

export const AtCoderSubmission = {
  new(arg: AtCoderSubmission): AtCoderSubmission {
    return {
      ...arg,
    };
  },

  fromSeq(
    arg: TupleFromInterface<AtCoderSubmission, ["date", "task", "status"]>,
  ) {
    return {
      date: arg[0],
      status: arg[1],
      task: arg[2],
    };
  },
};
