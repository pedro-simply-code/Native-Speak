export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "How much does a project cost?",
    answer:
      "Every project is scoped individually, because a marketing site and a platform rebuild are not the same amount of work. After a short discovery conversation we send a written scope with a fixed quote, so you know the number before anything starts.",
  },
  {
    question: "How long does a project take?",
    answer:
      "It depends on scope, content readiness and how many stakeholders need to review. We share a stage-by-stage timeline in the proposal and flag risks before the project starts rather than after a deadline has already slipped.",
  },
  {
    question: "Who owns the code and the design files?",
    answer:
      "You do. On final payment the repository, design files and accounts are handed over to you, documented so another developer can pick the project up without reverse-engineering it.",
  },
  {
    question: "Do you work with agencies?",
    answer:
      "Yes. A large part of our work is white-label development for marketing and design agencies. We work under your brand, inside your process, and your client relationship stays yours.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "Next.js, React, TypeScript and PostgreSQL for platforms; custom WordPress themes with ACF, Bootstrap, Visual Composer and WPML for content sites; Figma for design. We pick the stack based on the problem, not on what is fashionable.",
  },
  {
    question: "Can you take over an existing project?",
    answer:
      "Usually yes. We start with a technical review of the codebase, hosting and content model, then tell you honestly whether it is worth continuing or whether a rebuild is cheaper in the long run.",
  },
  {
    question: "Do you offer support after launch?",
    answer:
      "Yes. We offer monthly retainers for maintenance, improvements and new features. You are not tied to one after launch — the handover documentation is yours either way.",
  },
  {
    question: "Where are you based?",
    answer:
      "We work remotely from Guatemala and the United States, overlapping with US business hours. Communication happens directly with the developers building your project.",
  },
  {
    question: "How do we start?",
    answer:
      "Send a short brief through the contact form with your goals, timeline and anything already decided. We reply within one business day with next steps or a few questions.",
  },
];
