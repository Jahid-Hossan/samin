// lib/db.ts - In-memory storage (use DB in production!)
let collections: any[] = [
  {
    _id: "1",
    username: "42-E-SE112-2025-CSE",
    section: "42-E",
    courseCode: "SE112",
    semester: "Summer 2025",
    faculty: "Faculty of Science and Information Technology (FSIT)",
    department: "Computer Science & Engineering (CSE)",
    teamCount: 12,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6", // "password123"
    creatorEmail: null,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    username: "65-A-EEE201-2025-EEE",
    section: "65-A",
    courseCode: "EEE201",
    semester: "Summer 2025",
    faculty: "Faculty of Engineering (FE)",
    department: "Electrical & Electronic Engineering (EEE)",
    teamCount: 15,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-15T09:15:00Z",
  },
];

let submissions: any[] = [
  {
    _id: "1",
    collectionId: "1",
    teamName: "Team Alpha",
    slideLink: "https://drive.google.com/example1",
    leaderEmail: "alpha@example.com",
    submittedAt: "2024-01-15T11:00:00Z",
  },
  {
    _id: "2",
    collectionId: "1",
    teamName: "Team Beta",
    slideLink: "https://drive.google.com/example2",
    leaderEmail: "beta@example.com",
    submittedAt: "2024-01-15T11:30:00Z",
  },
];

export { collections, submissions };
