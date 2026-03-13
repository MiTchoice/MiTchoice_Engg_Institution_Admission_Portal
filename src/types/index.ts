import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
  interface User {
    role: string;
  }
}

export interface QuizQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  category: string;
  difficulty: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
}

export interface ScoreData {
  correct: number;
  incorrect: number;
  attempted: number;
  netScore: number;
  percentage: number;
  eligibleBranches: string[];
}

export interface UserProgress {
  registered: boolean;
  quizCompleted: boolean;
  branchChosen: boolean;
  admissionSubmitted: boolean;
}

export type Branch = "CSE" | "IT" | "ECE" | "EE" | "ME" | "CE" | "BSc";
