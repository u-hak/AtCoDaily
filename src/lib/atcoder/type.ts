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
  user: AtCoderUser;
  task: AtCoderTask;
  status: "RE" | "TLE" | "WA" | "AC";
}

export const AtCoderSubmission = {
  new(arg: AtCoderSubmission): AtCoderSubmission {
    return {
      ...arg,
    };
  },
};

export interface AtCoderUser {
  name: string;
}

export const AtCoderUser = {
  fromString(str: string): AtCoderUser {
    return {
      name: str,
    };
  },
};
