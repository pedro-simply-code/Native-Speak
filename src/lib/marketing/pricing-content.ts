export type PricingDuration = 25 | 50;
export type PricingClassType = "oneOnOne" | "paired";
export type PricingBadge = "popular" | "value";

export type PricingPlan = {
  classCount: number;
  countLabel: string;
  subtitle: string;
  pricePerClass: number;
  pricePerClassSuffix: string;
  perStudentLine?: string;
  total: number;
  features: readonly string[];
  badge?: PricingBadge;
  monthlyNote: string;
};

export type PricingTier = {
  sectionTitle: string;
  intro: string;
  plans: readonly PricingPlan[];
};

const monthlyNote = "Monthly payment options available at checkout." as const;

function tier(
  sectionTitle: string,
  intro: string,
  plans: PricingPlan[],
): PricingTier {
  return { sectionTitle, intro, plans };
}

export const pricingPage = {
  title: "Pricing",
  intro: "Choose your session length, class type, and package size.",
  steps: ["Choose your duration", "Choose your class type", "Select your ideal package"],
} as const;

export const pricingTiers: Record<
  `${PricingDuration}-${PricingClassType}`,
  PricingTier
> = {
  "25-oneOnOne": tier(
    "1 on 1 – 25 min. classes",
    "Most homeschool families choose the 60 or 90-class plan to give their child a full year of consistent, live Spanish instruction with 2–3 short 25-minute lessons per week. Working towards high school credit? See our FAQ or contact our team before enrolling so we can help you choose the right plan.",
    [
      {
        classCount: 30,
        countLabel: "30 classes",
        subtitle: "Starter support",
        pricePerClass: 16,
        pricePerClassSuffix: "/ class",
        total: 480,
        features: [
          "Best for trying out live Spanish or getting targeted help in one area",
          "Great for light schedules or supplementing another Spanish program",
        ],
        monthlyNote,
      },
      {
        classCount: 60,
        countLabel: "60 classes",
        subtitle: "Steady progress",
        pricePerClass: 12,
        pricePerClassSuffix: "/ class",
        total: 720,
        features: [
          "Ideal for consistent practice 2 times per week so Spanish actually sticks",
          "Can sometimes work as a full school year's worth of classes for families going at a comfortable pace",
        ],
        badge: "popular",
        monthlyNote,
      },
      {
        classCount: 90,
        countLabel: "90 classes",
        subtitle: "Fluency builder",
        pricePerClass: 11,
        pricePerClassSuffix: "/ class",
        total: 990,
        features: [
          "Best for younger learners who need shorter, more frequent lessons",
          "Designed for fast progress with 3 classes per week and stronger fluency gains",
        ],
        badge: "value",
        monthlyNote,
      },
    ],
  ),
  "25-paired": tier(
    "Paired – 25 min. classes",
    "Most families with two learners choose the 60 or 90-class plan so both kids stay on track together with 2–3 short lessons per week. Working towards high school credit? See our FAQ, or contact our team before enrolling so we can help you choose the right plan. Recommended for siblings within 3 grade levels of each other.",
    [
      {
        classCount: 30,
        countLabel: "30 paired classes",
        subtitle: "Sibling starter",
        pricePerClass: 24,
        pricePerClassSuffix: "/ class (for both students)",
        perStudentLine: "Only $12.00 per student, per class",
        total: 720,
        features: [
          "Great for trying paired lessons or adding light support to another Spanish program",
          "Works well for short terms, summer study, or topping up existing credits",
        ],
        monthlyNote,
      },
      {
        classCount: 60,
        countLabel: "60 paired classes",
        subtitle: "Sibling year plan",
        pricePerClass: 18,
        pricePerClassSuffix: "/ class",
        perStudentLine: "Only $9.00 per student, per class",
        total: 1080,
        features: [
          "Ideal for 2 live classes per week to build steady progress together",
          "Can work as a full school year's worth of classes for both kids at a comfortable pace",
          "Enough time to build solid listening, speaking, and reading skills together",
        ],
        badge: "popular",
        monthlyNote,
      },
      {
        classCount: 90,
        countLabel: "90 paired classes",
        subtitle: "Sibling fluency builder",
        pricePerClass: 16,
        pricePerClassSuffix: "/ class",
        total: 1440,
        features: [
          "Best for young learners who benefit from 3 short lessons per week",
          "Perfect for faster progress, extra review, and stronger long-term fluency",
        ],
        badge: "value",
        monthlyNote,
      },
    ],
  ),
  "50-oneOnOne": tier(
    "1 on 1 – 50 min. classes",
    "Most teens and adult learners choose the 60 or 90-class plan to build toward a full year of Spanish and real conversational confidence, with 2–3 lessons per week. Credit amounts depend on completing required coursework, hours and assessments. See our FAQ, or contact our team before enrolling so we can help you choose the right plan.",
    [
      {
        classCount: 30,
        countLabel: "30 classes",
        subtitle: "Focused support",
        pricePerClass: 23,
        pricePerClassSuffix: "/ class",
        total: 690,
        features: [
          "Can earn up to 0.50 high school credit when completed with required study work",
          "Perfect for targeted help, test prep, or brushing up rusty Spanish",
        ],
        monthlyNote,
      },
      {
        classCount: 60,
        countLabel: "60 classes",
        subtitle: "Full credit plan",
        pricePerClass: 17,
        pricePerClassSuffix: "/ class",
        total: 1020,
        features: [
          "Can earn 1.0 high school credit over two semesters when combined with required coursework and an average class pace",
          "Ideal for 2 classes per week to build strong speaking, listening, and grammar skills",
        ],
        badge: "popular",
        monthlyNote,
      },
      {
        classCount: 90,
        countLabel: "90 classes",
        subtitle: "Fluency track",
        pricePerClass: 16,
        pricePerClassSuffix: "/ class",
        total: 1440,
        features: [
          "Can earn 0.5 additional high school credit (with required coursework), or use for extra review — helpful if your student needs more time to complete a credit",
          "Best for faster progress with 3 classes per week and deeper fluency for school, travel, or work",
        ],
        badge: "value",
        monthlyNote,
      },
    ],
  ),
  "50-paired": tier(
    "Paired – 50 min. classes",
    "Most families with two older learners choose the 60 or 90-class plan to build toward a full year of Spanish and real fluency together with 2–3 live lessons per week. Working towards high school credit? See our FAQ, or contact our team before enrolling so we can help you choose the right plan. Recommended for learners within 3 grade levels of each other.",
    [
      {
        classCount: 30,
        countLabel: "30 paired classes",
        subtitle: "Paired starter",
        pricePerClass: 34,
        pricePerClassSuffix: "/ class (for both students)",
        perStudentLine: "Only $17.00 per student, per class",
        total: 1020,
        features: [
          "Can earn up to 0.5 high school credit with focused support and structured homework",
          "Great for targeted help, test prep, or brushing up Spanish together",
        ],
        monthlyNote,
      },
      {
        classCount: 60,
        countLabel: "60 paired classes",
        subtitle: "Paired full credit plan",
        pricePerClass: 26,
        pricePerClassSuffix: "/ class",
        perStudentLine: "Only $13.00 per student, per class",
        total: 1560,
        features: [
          "Can earn up to 1.0 high school credit over two semesters with required coursework",
          "Ideal for 2 live classes per week so both students build strong speaking and grammar skills",
        ],
        badge: "popular",
        monthlyNote,
      },
      {
        classCount: 90,
        countLabel: "90 paired classes",
        subtitle: "Paired fluency track",
        pricePerClass: 23,
        pricePerClassSuffix: "/ class",
        total: 2070,
        features: [
          "Add 0.5 additional high school credit or use for extra review and conversation practice",
          "Best for faster progress with 3 classes per week for both learners",
        ],
        badge: "value",
        monthlyNote,
      },
    ],
  ),
};

export const pricingDurationOptions = [
  { id: 25 as const, label: "25-minute class" },
  { id: 50 as const, label: "50-minute class" },
] as const;

export const pricingClassTypeOptions = [
  {
    id: "oneOnOne" as const,
    label: "1 on 1",
    description: "1 student per teacher in the class",
  },
  {
    id: "paired" as const,
    label: "Paired",
    description: "2 students per teacher in the class",
  },
] as const;
