// 60-item IPIP Big Five personality questions adapted for MBTI dimensions
// Source: IPIP Big Five (Goldberg, 1992) — Public domain: https://ipip.ori.org/

export interface PersonalityQuestion {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  direction: 1 | -1;
}

// direction: 1 = agree → first letter (E, S, T, J)
//           -1 = agree → second letter (I, N, F, P)
export const QUESTIONS: PersonalityQuestion[] = [
  // ── E/I Dimension (Extraversion vs Introversion) ──
  { id: 1, text: "I am very fun to be around and usually the center of attention at social events.", dimension: "EI", direction: 1 },
  { id: 2, text: "I don't talk a lot.", dimension: "EI", direction: -1 },
  { id: 3, text: "I feel comfortable around people.", dimension: "EI", direction: 1 },
  { id: 4, text: "I am quiet and prefer not to be noticed by others.", dimension: "EI", direction: -1 },
  { id: 5, text: "I start conversations.", dimension: "EI", direction: 1 },
  { id: 6, text: "I have little to say.", dimension: "EI", direction: -1 },
  { id: 7, text: "I talk to a lot of different people at parties.", dimension: "EI", direction: 1 },
  { id: 8, text: "I don't like to draw attention to myself.", dimension: "EI", direction: -1 },
  { id: 9, text: "I don't mind being the center of attention.", dimension: "EI", direction: 1 },
  { id: 10, text: "I am quiet around strangers.", dimension: "EI", direction: -1 },
  { id: 11, text: "I feel energized after spending time with a group of people.", dimension: "EI", direction: 1 },
  { id: 12, text: "I prefer to work alone rather than in a team.", dimension: "EI", direction: -1 },
  { id: 13, text: "I enjoy meeting new people.", dimension: "EI", direction: 1 },
  { id: 14, text: "I prefer to keep my thoughts to myself.", dimension: "EI", direction: -1 },
  { id: 15, text: "I find it easy to approach others and introduce myself.", dimension: "EI", direction: 1 },

  // ── S/N Dimension (Sensing/Observant vs Intuition) ──
  { id: 16, text: "I have a rich vocabulary.", dimension: "SN", direction: -1 },
  { id: 17, text: "I find it hard to understand complicated theories or things I cannot see or touch.", dimension: "SN", direction: 1 },
  { id: 18, text: "I am very creative and can easily picture interesting ideas in my mind.", dimension: "SN", direction: -1 },
  { id: 19, text: "I don't care much for deep theories; I prefer focusing on real, practical things.", dimension: "SN", direction: 1 },
  { id: 20, text: "I have excellent ideas.", dimension: "SN", direction: -1 },
  { id: 21, text: "I do not have a good imagination.", dimension: "SN", direction: 1 },
  { id: 22, text: "I am quick to understand things.", dimension: "SN", direction: -1 },
  { id: 23, text: "I use difficult words.", dimension: "SN", direction: -1 },
  { id: 24, text: "I spend time reflecting on things.", dimension: "SN", direction: -1 },
  { id: 25, text: "I am full of ideas.", dimension: "SN", direction: -1 },
  { id: 26, text: "I prefer to focus on the facts rather than the big picture.", dimension: "SN", direction: 1 },
  { id: 27, text: "I enjoy exploring new theories and concepts.", dimension: "SN", direction: -1 },
  { id: 28, text: "I trust my direct experience more than my intuition.", dimension: "SN", direction: 1 },
  { id: 29, text: "I like to think about the deeper meaning behind things.", dimension: "SN", direction: -1 },
  { id: 30, text: "I prefer practical, hands-on work over theoretical discussions.", dimension: "SN", direction: 1 },

  // ── T/F Dimension (Thinking vs Feeling) ──
  { id: 31, text: "I feel little concern for others.", dimension: "TF", direction: 1 },
  { id: 32, text: "I am interested in people.", dimension: "TF", direction: -1 },
  { id: 33, text: "I insult people.", dimension: "TF", direction: 1 },
  { id: 34, text: "I sympathize with others' feelings.", dimension: "TF", direction: -1 },
  { id: 35, text: "I am not interested in other people's problems.", dimension: "TF", direction: 1 },
  { id: 36, text: "I have a soft heart.", dimension: "TF", direction: -1 },
  { id: 37, text: "I am not really interested in others.", dimension: "TF", direction: 1 },
  { id: 38, text: "I take time out for others.", dimension: "TF", direction: -1 },
  { id: 39, text: "I feel others' emotions.", dimension: "TF", direction: -1 },
  { id: 40, text: "I make people feel at ease.", dimension: "TF", direction: -1 },
  { id: 41, text: "I prioritize logic over feelings when making decisions.", dimension: "TF", direction: 1 },
  { id: 42, text: "I consider how my decisions affect others emotionally.", dimension: "TF", direction: -1 },
  { id: 43, text: "I think it is more important to be fair and follow the rules than to act based on feelings or pity.", dimension: "TF", direction: 1 },
  { id: 44, text: "I find it easy to empathize with others.", dimension: "TF", direction: -1 },
  { id: 45, text: "I believe the best decisions are based on objective analysis.", dimension: "TF", direction: 1 },

  // ── J/P Dimension (Judging vs Perceiving) ──
  { id: 46, text: "I am always prepared.", dimension: "JP", direction: 1 },
  { id: 47, text: "I leave my things lying around or keep my stuff close by.", dimension: "JP", direction: -1 },
  { id: 48, text: "I pay attention to details.", dimension: "JP", direction: 1 },
  { id: 49, text: "I make a mess of things.", dimension: "JP", direction: -1 },
  { id: 50, text: "I do my housework or errands immediately without waiting.", dimension: "JP", direction: 1 },
  { id: 51, text: "I often forget to put things back in their proper place.", dimension: "JP", direction: -1 },
  { id: 52, text: "I like order.", dimension: "JP", direction: 1 },
  { id: 53, text: "I avoid doing the work or responsibilities I am supposed to do.", dimension: "JP", direction: -1 },
  { id: 54, text: "I follow a schedule.", dimension: "JP", direction: 1 },
  { id: 55, text: "I am very careful and strict about making sure my work is perfect.", dimension: "JP", direction: 1 },
  { id: 56, text: "I prefer to go with the flow rather than follow a plan.", dimension: "JP", direction: -1 },
  { id: 57, text: "I like to have things decided and settled.", dimension: "JP", direction: 1 },
  { id: 58, text: "I enjoy keeping my options open.", dimension: "JP", direction: -1 },
  { id: 59, text: "I set clear goals and work steadily toward them.", dimension: "JP", direction: 1 },
  { id: 60, text: "I tend to start many projects but finish few of them.", dimension: "JP", direction: -1 },
];

export const DIMENSION_LABELS: Record<string, string> = {
  EI: "Mind: Extraversion vs Introversion",
  SN: "Energy: Observant vs Intuitive",
  TF: "Nature: Thinking vs Feeling",
  JP: "Tactics: Judging vs Prospecting",
};
