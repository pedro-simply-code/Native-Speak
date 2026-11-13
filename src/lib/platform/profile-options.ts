export const TEACHING_AGE_GROUPS = [
  "Preschool (3–5)",
  "Elementary (6–10)",
  "Middle school (11–13)",
  "High school (14–18)",
  "Adults",
] as const;

export const LANGUAGES = ["Spanish", "English", "French", "Portuguese"] as const;

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "Europe/Madrid",
] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const PROFICIENCY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const CLASS_PACKAGES = [
  { id: "trial", label: "Single trial class (1 free)", classes: 1, cents: 0 },
  { id: "pack-30", label: "30 classes", classes: 30, cents: 48000 },
  { id: "pack-60", label: "60 classes", classes: 60, cents: 72000 },
  { id: "pack-90", label: "90 classes", classes: 90, cents: 96000 },
] as const;
