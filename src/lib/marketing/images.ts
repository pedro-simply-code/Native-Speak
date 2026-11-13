/** Remote stock photos (Unsplash) — demo placeholders only. */

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const marketingImages = {
  hero: unsplash("photo-1588196749597-9ff075ee6b5b", 1400),
  heroAlt: "Child smiling during an online video lesson at home",
  classroom: unsplash("photo-1577896851231-70ef18881754", 1200),
  classroomAlt: "Teacher guiding students in a bright classroom",
  conversation: unsplash("photo-1522202176988-66273c2fd55f", 1200),
  conversationAlt: "Small group collaborating around a laptop",
  books: unsplash("photo-1512820790803-83ca734da794", 1000),
  booksAlt: "Stack of books on a wooden desk",
  laptop: unsplash("photo-1434030216411-0b793f4b4173", 1200),
  laptopAlt: "Student learning on a laptop",
  teacher: unsplash("photo-1544717297-fa95b6ee9643", 1000),
  teacherAlt: "Teacher explaining a lesson on a whiteboard",
  schoolHall: unsplash("photo-1562774053-701939374585", 1200),
  schoolHallAlt: "Students walking on a university campus",
  testimonials: [
    {
      src: unsplash("photo-1544005313-94ddf0286df2", 400),
      alt: "Portrait of Sharon K",
    },
    {
      src: unsplash("photo-1507003211169-0a1dd7228f2d", 400),
      alt: "Portrait of Mark C",
    },
    {
      src: unsplash("photo-1580489944761-15a19d654956", 400),
      alt: "Portrait of Cindy D",
    },
  ],
  programs: {
    preschool: unsplash("photo-1587654780291-39c9404d746b", 900),
    elementary: unsplash("photo-1503676260728-1c00da094a0b", 900),
    middle: unsplash("photo-1580582932707-520aed937b7b", 900),
    high: unsplash("photo-1524178232363-1fb2b075b655", 900),
    adults: unsplash("photo-1573497019940-1c28c88b4f3e", 900),
    schools: unsplash("photo-1562774053-701939374585", 900),
  },
  blog: {
    chooseProgram: unsplash("photo-1456513080510-7bf3a84b82f8", 1000),
    homeschoolTips: unsplash("photo-1523240795612-9a054b0db644", 1000),
    immersion: unsplash("photo-1517245386807-bb43f82c33c4", 1000),
  },
} as const;
