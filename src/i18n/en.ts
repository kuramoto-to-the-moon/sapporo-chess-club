export default {
  site: {
    name: "Sapporo Chess Club",
    description:
      "Sapporo Chess Club is a community for chess enthusiasts in Hokkaido. We hold meetups twice a month and three official tournaments a year. Observation is free, beginners welcome.",
  },
  seo: {
    home: {
      titleSuffix: "Chess Meetups & Tournaments in Hokkaido",
      description:
        "Official site of Sapporo Chess Club. A community of chess players in Hokkaido, Japan — twice-monthly meetups and three annual tournaments (Hokkaido Chess Championship and more). Free observation, visitors welcome.",
    },
    schedule: {
      description:
        "Annual schedule for Sapporo Chess Club meetups and tournaments (Hokkaido Chess Championship, Sapporo Open, and more) — twice-monthly meetings and three official tournaments per year.",
    },
    tournaments: {
      description:
        "Tournament archive of Sapporo Chess Club from 2000 to present. Details PDFs, results PDFs, and PGN game records. Hokkaido Chess Championship and more.",
    },
    announcementsList: {
      description:
        "Latest news and announcements from Sapporo Chess Club — meetup reports, tournament notices, and venue updates.",
    },
    announcementsArchive: {
      description:
        "Archive of past Sapporo Chess Club announcements. Browse older meetup reports and tournament notices by year.",
    },
  },
  nav: {
    home: "Home",
    tournaments: "Tournaments",
    announcements: "News",
    skipToMain: "Skip to main content",
    openInNewTab: "(opens in new tab)",
    switchLanguage: "日本語に切り替え",
    close: "閉じる",
    languageShort: "JA",
  },
  sections: {
    home: "HOME",
    schedule: "SCHEDULE",
    tournaments: "TOURNAMENTS",
    announcements: "NEWS",
  },
  hero: {
    subtitle: "A community for chess enthusiasts in Hokkaido. Beginners welcome.",
  },
  nextEvent: {
    meeting: "Next Meeting",
    event: "Next Event",
  },
  about: {
    label: "About the Club",
    body: "Sapporo Chess Club is a chess circle that has been active in Sapporo, Hokkaido since the 1990s. Everyone is welcome — from elementary school students to working adults and seniors — and members are happy to help newcomers. Whether you want to try chess for the first time or are looking for opponents, feel free to drop by.",
  },
  activities: {
    label: "Activities",
    meetup: "Meetups",
    meetupDesc: "Twice a month",
    tournament: "Tournaments",
    tournamentDesc: "3 per year",
    lesson: "Lessons",
    lessonDesc: "By a member, off-site",
  },
  schedule: {
    label: "Schedule",
    pageTitle: "Schedule",
    pageSubtitle: "Annual Schedule",
    viewFullSchedule: "View full schedule →",
    noUpcoming: "No upcoming events.",
    filterByYear: "Filter by year",
    allYears: "All years",
    all: "All",
    dayOfWeekSuffix: "",
    roomSuffix: "",
    yearSuffix: "",
  },
  clubInfo: {
    fee: "Entry Fee",
    venue: "Venue",
    general: "General",
    students: "Students",
    observation: "Observation & First Visit",
    free: "Free",
    viewOnMap: "View on Google Maps",
  },
  lessons: {
    label: "Chess Lessons",
    viewDetails: "View details",
  },
  rss: {
    title: "Sapporo Chess Club — News",
    description: "Latest updates from Sapporo Chess Club",
  },
  announcements: {
    label: "News",
    pageTitle: "News",
    pageSubtitle: "Latest updates from the club",
    viewAll: "View all news →",
    back: "← All news",
    prev: "Previous",
    next: "Next",
    empty: "No news yet.",
    englishNotAvailable: "Some articles are not yet available in English and are shown in Japanese.",
    englishNotAvailableDetail: "This article is not yet available in English. The content below is shown in Japanese.",
    englishNotAvailableShort: "Shown in Japanese.",
    archivePageTitle: "News Archive",
    viewArchive: "View older announcements →",
    archiveEmpty: "Archive is empty.",
    subscribeRss: "Subscribe via RSS",
  },
  resources: {
    label: "Links & Resources",
    pamphlet: "Club Pamphlet (PDF)",
    jca: "Japan Chess Federation",
  },
  contact: {
    label: "Contact",
  },
  tournament: {
    pageTitle: "Tournaments",
    pageSubtitle: "Full archive from 2000 to present",
    detailsPdf: "Details PDF",
    resultsPdf: "Results PDF",
    gamesPgn: "Game Records PGN",
    gamesPgnAnnotated: "Game Records PGN (Annotated)",
    downloadAria: (label: string) => `${label} download`,
  },
  badge: {
    tournamentTag: "Tournament",
    meetingTag: "Meeting",
  },
  menu: {
    sectionLabel: "Sections",
    schedule: "Schedule",
    activities: "Activities",
    info: "Entry Fee & Venue",
    lessons: "Chess Lessons",
    links: "Links",
    contact: "Contact",
  },
} as const;
