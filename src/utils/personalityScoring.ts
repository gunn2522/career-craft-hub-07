import { QUESTIONS } from "@/data/personalityQuestions";
import { PERSONALITY_TYPES, type PersonalityType } from "@/data/personalityTypes";

export interface DimensionScores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

export interface DimensionPercentages {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export function calculateScores(answers: (number | null)[]): DimensionScores {
  const scores: DimensionScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  QUESTIONS.forEach((q, i) => {
    if (answers[i] !== null && answers[i] !== undefined) {
      scores[q.dimension] += answers[i]! * q.direction;
    }
  });

  return scores;
}

export function getPersonalityType(scores: DimensionScores): string {
  let type = "";
  type += scores.EI >= 0 ? "E" : "I";
  type += scores.SN >= 0 ? "S" : "N";
  type += scores.TF >= 0 ? "T" : "F";
  type += scores.JP >= 0 ? "J" : "P";
  return type;
}

export function getPercentages(scores: DimensionScores): DimensionPercentages {
  const maxPerDimension = 15 * 3; // 15 questions × max value 3
  const pcts: Record<string, number> = {};

  (["EI", "SN", "TF", "JP"] as const).forEach((dim) => {
    const raw = scores[dim];
    const ratio = Math.abs(raw) / maxPerDimension;
    const dominant = Math.round(50 + ratio * 50);
    const secondary = 100 - dominant;

    const letters = dim.split("");
    if (raw >= 0) {
      pcts[letters[0]] = dominant;
      pcts[letters[1]] = secondary;
    } else {
      pcts[letters[0]] = secondary;
      pcts[letters[1]] = dominant;
    }
  });

  return pcts as unknown as DimensionPercentages;
}

export function getPersonalityProfile(answers: (number | null)[]): {
  type: string;
  profile: PersonalityType;
  percentages: DimensionPercentages;
  scores: DimensionScores;
} | null {
  const scores = calculateScores(answers);
  const type = getPersonalityType(scores);
  const profile = PERSONALITY_TYPES[type];

  if (!profile) return null;

  return {
    type,
    profile,
    percentages: getPercentages(scores),
    scores,
  };
}
