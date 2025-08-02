export interface Collection {
  username: string;
  section: string;
  courseCode: string;
  semester: string;
  faculty: string;
  department: string;
  teamCount: number;
  password: string;
  creatorEmail?: string;
  createdAt: Date;
}

export interface Submission {
  collectionId: string;
  teamName: string;
  slideLink: string;
  leaderEmail?: string;
  submittedAt: Date;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}
