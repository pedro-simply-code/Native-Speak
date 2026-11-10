import { marketingImages } from "@/lib/marketing/images";

export const aboutContent = {
  title: "About Native Speak",
  intro:
    "We are building a small, conversation-first Spanish academy — live teachers, human placement, and honest expectations while we onboard families and school pilots.",
  pillars: [
    {
      title: "Live over recorded",
      body: "Speaking practice with a real instructor beats passive video. Every product decision starts from that idea.",
    },
    {
      title: "Learners, not logos",
      body: "We are new, so we will not fake testimonials or inflated stats. We would rather earn trust one class at a time.",
    },
    {
      title: "Built for real calendars",
      body: "Homeschoolers, working parents, and busy teens get flexible booking and clear communication in English when needed.",
    },
  ],
  image: marketingImages.teacher,
  imageAlt: marketingImages.teacherAlt,
};

export const schoolsContent = {
  title: "Spanish for schools",
  intro:
    "Run a pilot with live Spanish instruction that complements your curriculum. We are selectively partnering with charters, hybrid, and private programs as capacity grows.",
  bullets: [
    "Cohort scheduling with a single partner contact",
    "Simple reporting for administrators and parents",
    "Native teachers aligned to your calendar",
    "Low-risk pilot before a wider rollout",
  ],
  image: marketingImages.schoolHall,
  imageAlt: marketingImages.schoolHallAlt,
};

export const freeClassContent = {
  title: "Try a free class",
  intro:
    "No credit card required. Tell us about your learner and we will match you with a teacher for a live 25-minute introduction while we are in launch.",
  image: marketingImages.conversation,
  imageAlt: marketingImages.conversationAlt,
};

export const blogPosts = [
  {
    slug: "how-to-choose-spanish-program",
    title: "How to choose the right Spanish program for your child",
    excerpt:
      "Age, session length, and learning style matter. Compare preschool, elementary, and secondary tracks before you commit.",
    date: "March 12, 2026",
    readMinutes: 6,
    image: marketingImages.blog.chooseProgram,
    imageAlt: "Open planner and study materials on a desk",
    body: [
      "Start with your learner's age and attention span. Shorter 25-minute sessions keep younger students engaged, while teens benefit from 50-minute conversation blocks.",
      "Look for live instruction with native speakers — passive video courses rarely build speaking confidence.",
      "Ask how progress is measured. Even homeschool families appreciate simple notes after each class.",
    ],
  },
  {
    slug: "homeschool-spanish-tips",
    title: "Five homeschool Spanish habits that actually stick",
    excerpt:
      "Small weekly rituals beat cramming. Here is how families weave Spanish into everyday life between classes.",
    date: "February 3, 2026",
    readMinutes: 5,
    image: marketingImages.blog.homeschoolTips,
    imageAlt: "Children learning together at home",
    body: [
      "Label objects around the house in Spanish and review them before each lesson.",
      "Schedule classes at the same time each week so Spanish becomes part of the routine.",
      "Celebrate micro-wins — a full sentence, a joke understood, a song remembered.",
    ],
  },
  {
    slug: "why-immersion-works-online",
    title: "Why immersion still works in a video classroom",
    excerpt:
      "Real-time conversation with a patient teacher creates the same brain pathways as in-person immersion.",
    date: "January 18, 2026",
    readMinutes: 7,
    image: marketingImages.blog.immersion,
    imageAlt: "Bright workspace prepared for an online meeting",
    body: [
      "Immersion is about meaningful input, not geography. A skilled teacher adjusts speed, vocabulary, and corrections in the moment.",
      "Short, frequent sessions outperform occasional marathons — especially for school-age learners.",
      "Pair live classes with light homework: journaling, voice memos, or reading aloud for five minutes.",
    ],
  },
] as const;

export type BlogSlug = (typeof blogPosts)[number]["slug"];
