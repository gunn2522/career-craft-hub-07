export interface PersonalityType {
  code: string;
  title: string;
  emoji: string;
  tagline: string;
  role: "analysts" | "diplomats" | "sentinels" | "explorers";
  roleLabel: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  relationships: string;
  careers: string[];
  growth: string;
}

export const PERSONALITY_TYPES: Record<string, PersonalityType> = {
  INTJ: {
    code: "INTJ", title: "The Architect", emoji: "🏛️",
    tagline: "Imaginative and strategic thinkers, with a plan for everything.",
    role: "analysts", roleLabel: "Analyst",
    overview: "INTJs are analytical problem-solvers, eager to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement, whether at work, at home, or in themselves.",
    strengths: ["Strategic and long-range thinking", "Independent and determined", "High standards and strong work ethic", "Creative and innovative problem-solver", "Excellent at synthesizing complex information"],
    weaknesses: ["Can appear arrogant or dismissive", "Overly critical of inefficiency in others", "May struggle with emotional expression", "Tendency to overthink and over-plan", "Can be impatient with those who don't keep up"],
    relationships: "In relationships, INTJs value intellectual compatibility above all. They seek partners who can match their depth of thought and who respect their need for independence.",
    careers: ["Strategic Planner", "Software Architect", "Scientist / Researcher", "Investment Banker", "Project Manager", "University Professor", "Systems Engineer", "Management Consultant"],
    growth: "INTJs can grow by developing their emotional intelligence and learning to appreciate perspectives that differ from their own."
  },
  INTP: {
    code: "INTP", title: "The Logician", emoji: "🔬",
    tagline: "Innovative inventors with an unquenchable thirst for knowledge.",
    role: "analysts", roleLabel: "Analyst",
    overview: "INTPs are philosophical innovators, fascinated by logical analysis, systems, and design. They are preoccupied with theory, and search for the universal law behind everything they see.",
    strengths: ["Exceptional analytical and logical skills", "Original and creative thinker", "Open-minded and flexible", "Objective and fair-minded", "Deeply knowledgeable in areas of interest"],
    weaknesses: ["Can be insensitive to emotional cues", "May procrastinate on practical matters", "Difficulty following through on ideas", "Can become isolated and withdrawn", "Tendency to be overly abstract"],
    relationships: "INTPs approach relationships with the same analytical mind they apply to everything. They value intellectual stimulation and need a partner who can engage in deep conversations.",
    careers: ["Software Developer", "Mathematician", "Philosopher", "Data Scientist", "Research Scientist", "Technical Writer", "Game Designer", "Forensic Analyst"],
    growth: "INTPs benefit from pushing themselves to take action on their ideas rather than endlessly refining them in theory."
  },
  ENTJ: {
    code: "ENTJ", title: "The Commander", emoji: "⚔️",
    tagline: "Bold, imaginative, and strong-willed leaders, always finding a way — or making one.",
    role: "analysts", roleLabel: "Analyst",
    overview: "ENTJs are strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions, and enjoy developing long-range plans.",
    strengths: ["Natural-born leader with confidence", "Efficient and energetic", "Strong-willed and determined", "Strategic and visionary thinker", "Excellent at organizing people and resources"],
    weaknesses: ["Can be domineering and stubborn", "Impatient with slower-paced individuals", "May struggle with emotional sensitivity", "Can be ruthlessly rational", "Tendency to overlook others' feelings"],
    relationships: "ENTJs bring the same passion and commitment to their relationships as they do to their careers. They seek partners who are equally ambitious.",
    careers: ["CEO / Executive", "Entrepreneur", "Corporate Strategist", "Lawyer", "Business Consultant", "Political Leader", "Financial Manager", "Operations Director"],
    growth: "ENTJs grow by learning to slow down and consider the emotional impact of their decisions on others."
  },
  ENTP: {
    code: "ENTP", title: "The Debater", emoji: "💡",
    tagline: "Smart and curious thinkers who cannot resist an intellectual challenge.",
    role: "analysts", roleLabel: "Analyst",
    overview: "ENTPs are inspired innovators, motivated to find new solutions to intellectually challenging problems. They are curious and clever, and seek to comprehend the people, systems, and principles that surround them.",
    strengths: ["Quick-witted and clever", "Excellent brainstormer", "Charismatic and energetic", "Adaptable and resourceful", "Fearless in challenging norms"],
    weaknesses: ["Can be argumentative for sport", "May struggle with follow-through", "Insensitive to others' feelings at times", "Easily bored with routine tasks", "Can be overly competitive"],
    relationships: "ENTPs bring excitement and intellectual energy to relationships. They seek partners who can keep up with their quick minds.",
    careers: ["Entrepreneur", "Marketing Director", "Creative Director", "Journalist", "Venture Capitalist", "Stand-up Comedian", "Political Analyst", "Product Manager"],
    growth: "ENTPs grow by learning to follow through on commitments and developing emotional sensitivity."
  },
  INFJ: {
    code: "INFJ", title: "The Advocate", emoji: "🌟",
    tagline: "Quiet and mystical, yet very inspiring and tireless idealists.",
    role: "diplomats", roleLabel: "Diplomat",
    overview: "INFJs are creative nurturers with a strong sense of personal integrity and a drive to help others realize their potential. They are idealistic and compassionate, but also decisive.",
    strengths: ["Deep insight into people and situations", "Principled and passionate", "Creative and inspired", "Altruistic and compassionate", "Determined and decisive when aligned with values"],
    weaknesses: ["Can be overly idealistic", "Prone to burnout from caring too much", "Difficulty opening up to others", "Perfectionistic tendencies", "May internalize conflict unhealthily"],
    relationships: "INFJs seek deep, meaningful connections above all. They are intensely loyal partners who value authenticity and emotional depth.",
    careers: ["Counselor / Therapist", "Writer / Author", "Nonprofit Director", "Psychologist", "Human Resources Manager", "Social Worker", "Professor", "UX Designer"],
    growth: "INFJs benefit from setting healthy boundaries and learning that they cannot save everyone."
  },
  INFP: {
    code: "INFP", title: "The Mediator", emoji: "🦋",
    tagline: "Poetic, kind, and altruistic people, always eager to help a good cause.",
    role: "diplomats", roleLabel: "Diplomat",
    overview: "INFPs are imaginative idealists, guided by their own core values and beliefs. They are compassionate and empathetic, wanting to help everyone they meet.",
    strengths: ["Deeply empathetic and compassionate", "Creative and imaginative", "Open-minded and flexible", "Passionate about their values", "Excellent written communicator"],
    weaknesses: ["Can be overly idealistic and impractical", "Tendency to take things too personally", "May struggle with decision-making", "Avoids conflict even when necessary", "Prone to self-isolation"],
    relationships: "INFPs are devoted and caring partners who seek deep emotional connection. They need relationships where they feel truly seen and understood.",
    careers: ["Writer / Poet", "Graphic Designer", "Therapist", "Social Worker", "Musician", "Librarian", "Environmental Scientist", "Art Therapist"],
    growth: "INFPs grow by developing practical skills to bring their ideals into reality."
  },
  ENFJ: {
    code: "ENFJ", title: "The Protagonist", emoji: "🎭",
    tagline: "Charismatic and inspiring leaders, able to mesmerize their listeners.",
    role: "diplomats", roleLabel: "Diplomat",
    overview: "ENFJs are idealist organizers, driven to implement their vision of what is best for humanity. They often act as catalysts for human growth.",
    strengths: ["Natural leader who inspires others", "Empathetic and understanding", "Reliable and devoted", "Charismatic communicator", "Excellent at bringing people together"],
    weaknesses: ["Can be overly selfless to the point of burnout", "May be manipulative when passionate", "Too idealistic at times", "Takes criticism personally", "Can be overly involved in others' lives"],
    relationships: "ENFJs are warm, generous, and deeply committed partners. They invest tremendous energy in nurturing their relationships.",
    careers: ["Teacher / Professor", "Life Coach", "Public Relations Manager", "Diplomat", "Human Resources Director", "Motivational Speaker", "Non-Profit Leader", "Event Planner"],
    growth: "ENFJs benefit from learning to prioritize their own needs alongside others'."
  },
  ENFP: {
    code: "ENFP", title: "The Campaigner", emoji: "🌈",
    tagline: "Enthusiastic, creative, and sociable free spirits, who can always find a reason to smile.",
    role: "diplomats", roleLabel: "Diplomat",
    overview: "ENFPs are people-centered creators with a focus on possibilities and a contagious enthusiasm for new ideas, people, and activities.",
    strengths: ["Enthusiastic and creative", "Excellent communicator", "Warm and caring", "Very perceptive about people", "Adaptable and energetic"],
    weaknesses: ["Can be disorganized and unfocused", "Overthinks and stresses easily", "May struggle with follow-through", "People-pleasing tendencies", "Difficulty with routine tasks"],
    relationships: "ENFPs are passionate, enthusiastic partners who bring creative energy and warmth to their relationships.",
    careers: ["Creative Director", "Journalist", "Actor / Performer", "Entrepreneur", "Marketing Specialist", "Life Coach", "Travel Writer", "Community Organizer"],
    growth: "ENFPs grow by developing discipline and follow-through."
  },
  ISTJ: {
    code: "ISTJ", title: "The Logistician", emoji: "📋",
    tagline: "Practical and fact-minded individuals, whose reliability cannot be doubted.",
    role: "sentinels", roleLabel: "Sentinel",
    overview: "ISTJs are responsible organizers, driven to create and enforce order within systems and institutions. They are neat, orderly, and have a procedure for everything.",
    strengths: ["Highly responsible and dependable", "Excellent attention to detail", "Strong sense of duty", "Patient and methodical", "Honest and direct"],
    weaknesses: ["Can be rigid and inflexible", "Stubborn in their ways", "Insensitive to emotions at times", "May resist change", "Tendency to be judgmental"],
    relationships: "ISTJs are loyal and committed partners who take their relationships seriously. They show love through acts of service and reliability.",
    careers: ["Accountant", "Military Officer", "Judge", "Financial Analyst", "Business Administrator", "Inspector / Auditor", "Database Administrator", "Civil Engineer"],
    growth: "ISTJs grow by developing emotional flexibility and openness to new experiences."
  },
  ISFJ: {
    code: "ISFJ", title: "The Defender", emoji: "🛡️",
    tagline: "Very dedicated and warm protectors, always ready to defend their loved ones.",
    role: "sentinels", roleLabel: "Sentinel",
    overview: "ISFJs are industrious caretakers, loyal to traditions and organizations. They are practical, compassionate, and caring.",
    strengths: ["Supportive and reliable", "Excellent memory for details about people", "Patient and observant", "Enthusiastic and hardworking", "Loyal and devoted"],
    weaknesses: ["Can neglect their own needs", "Overloading themselves with responsibilities", "Reluctant to change", "Taking criticism too personally", "Difficulty saying no"],
    relationships: "ISFJs are warm, nurturing partners who express love through thoughtful acts of care.",
    careers: ["Nurse / Healthcare Worker", "Social Worker", "Elementary Teacher", "Librarian", "Office Manager", "Interior Designer", "Veterinarian", "Human Resources Specialist"],
    growth: "ISFJs benefit from learning to prioritize their own needs and setting healthy boundaries."
  },
  ESTJ: {
    code: "ESTJ", title: "The Executive", emoji: "👔",
    tagline: "Excellent administrators, unsurpassed at managing things — or people.",
    role: "sentinels", roleLabel: "Sentinel",
    overview: "ESTJs are hardworking traditionalists, eager to take charge in organizing projects and people. They value predictability and prefer logical order.",
    strengths: ["Strong organizational skills", "Dedicated and honest", "Excellent at creating order", "Direct and confident", "Loyal and patient with responsibilities"],
    weaknesses: ["Can be inflexible and stubborn", "Uncomfortable with unconventional situations", "May be judgmental", "Difficulty expressing emotions", "Can be too focused on social status"],
    relationships: "ESTJs are steady, reliable partners who take commitments seriously.",
    careers: ["Business Manager", "Police Officer", "Judge", "Financial Officer", "School Administrator", "Real Estate Agent", "Insurance Agent", "Military Leader"],
    growth: "ESTJs grow by developing flexibility and emotional awareness."
  },
  ESFJ: {
    code: "ESFJ", title: "The Consul", emoji: "🤝",
    tagline: "Extraordinarily caring, social, and popular people, always eager to help.",
    role: "sentinels", roleLabel: "Sentinel",
    overview: "ESFJs are conscientious helpers, sensitive to the needs of others and energetically dedicated to their responsibilities.",
    strengths: ["Warm and caring with strong social skills", "Loyal and reliable", "Sensitive to others' needs", "Good at connecting with people", "Practical and down-to-earth"],
    weaknesses: ["Can be too needy for approval", "Overly sensitive to criticism", "Reluctant to improvise or innovate", "May be controlling", "Too selfless and neglect own needs"],
    relationships: "ESFJs are devoted, caring partners who thrive on creating warmth and harmony.",
    careers: ["Healthcare Administrator", "Event Coordinator", "Social Worker", "Public Relations Specialist", "Teacher", "Retail Manager", "Receptionist", "Personal Assistant"],
    growth: "ESFJs benefit from developing independence from others' opinions."
  },
  ISTP: {
    code: "ISTP", title: "The Virtuoso", emoji: "🔧",
    tagline: "Bold and practical experimenters, masters of all kinds of tools.",
    role: "explorers", roleLabel: "Explorer",
    overview: "ISTPs are observant artisans with an understanding of mechanics and an interest in troubleshooting. They approach environments with flexible logic.",
    strengths: ["Practical and resourceful", "Excellent in crisis situations", "Optimistic and energetic", "Creative and hands-on", "Easygoing and adaptable"],
    weaknesses: ["Can be insensitive and private", "Difficulty with long-term commitments", "Easily bored and restless", "Risk-prone behavior", "Stubbornly independent"],
    relationships: "ISTPs show love through actions rather than words. They are relaxed, adventurous partners.",
    careers: ["Mechanic / Engineer", "Pilot", "Forensic Scientist", "Paramedic", "Electrician", "Software Developer", "Carpenter", "Sports Coach"],
    growth: "ISTPs grow by developing emotional communication skills and long-term planning abilities."
  },
  ISFP: {
    code: "ISFP", title: "The Adventurer", emoji: "🎨",
    tagline: "Flexible and charming artists, always ready to explore and experience something new.",
    role: "explorers", roleLabel: "Explorer",
    overview: "ISFPs are gentle caretakers who live in the present moment and enjoy their surroundings with cheerful, low-key enthusiasm.",
    strengths: ["Charming and sensitive to others", "Imaginative and artistic", "Passionate and curious", "Bold and experimental", "Strong aesthetic sense"],
    weaknesses: ["Fiercely private and independent", "Unpredictable and easily stressed", "Overly competitive at times", "Difficulty with planning ahead", "Avoids confrontation"],
    relationships: "ISFPs are warm, supportive partners who express love through creative gestures and quality time.",
    careers: ["Artist / Designer", "Musician", "Veterinarian", "Chef", "Photographer", "Fashion Designer", "Landscape Architect", "Physical Therapist"],
    growth: "ISFPs grow by developing confidence to share their ideas and standing up for themselves."
  },
  ESTP: {
    code: "ESTP", title: "The Entrepreneur", emoji: "🚀",
    tagline: "Smart, energetic, and very perceptive people, who truly enjoy living on the edge.",
    role: "explorers", roleLabel: "Explorer",
    overview: "ESTPs are energetic thrill-seekers who bring dynamic energy to their interactions. They assess situations quickly and respond with practical solutions.",
    strengths: ["Bold and practical", "Direct and sociable", "Original and perceptive", "Excellent in crisis management", "Adaptable and resourceful"],
    weaknesses: ["Impatient with theory and abstraction", "Risk-prone and impulsive", "Unstructured and may miss details", "Can be insensitive and blunt", "Difficulty with long-term planning"],
    relationships: "ESTPs bring excitement, spontaneity, and fun to their relationships.",
    careers: ["Entrepreneur", "Sales Manager", "Paramedic / Firefighter", "Detective", "Stockbroker", "Sports Coach", "Marketing Executive", "TV Reporter"],
    growth: "ESTPs grow by developing patience and the ability to think long-term."
  },
  ESFP: {
    code: "ESFP", title: "The Entertainer", emoji: "🎉",
    tagline: "Spontaneous, energetic, and enthusiastic people — life is never boring around them.",
    role: "explorers", roleLabel: "Explorer",
    overview: "ESFPs are vivacious entertainers who charm and engage those around them. They are spontaneous, energetic, and fun-loving.",
    strengths: ["Enthusiastic and energetic", "Warm and generous", "Practical and observant", "Excellent people skills", "Bold and original"],
    weaknesses: ["Easily bored and unfocused", "Sensitive to criticism", "Poor long-term planner", "Can be materialistic", "Avoids difficult conversations"],
    relationships: "ESFPs are warm, affectionate partners who create joy and excitement in their relationships.",
    careers: ["Actor / Performer", "Event Planner", "Tour Guide", "Flight Attendant", "Interior Decorator", "Fitness Trainer", "Sales Representative", "Restaurant Manager"],
    growth: "ESFPs grow by developing focus and long-term thinking."
  },
};

export const ROLE_GROUPS = ["analysts", "diplomats", "sentinels", "explorers"] as const;
