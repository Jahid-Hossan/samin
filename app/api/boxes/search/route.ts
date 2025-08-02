import { type NextRequest, NextResponse } from "next/server"

// Mock database - In production, use MongoDB
const collections: any[] = [
  {
    _id: "1",
    username: "CS101-2024-CSE",
    section: "CS101",
    batch: "2024",
    faculty: "Faculty of Science and Information Technology (FSIT)",
    department: "Computer Science & Engineering (CSE)",
    teamCount: 12,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    username: "EEE201-2024-EEE",
    section: "EEE201",
    batch: "2024",
    faculty: "Faculty of Engineering (FE)",
    department: "Electrical & Electronic Engineering (EEE)",
    teamCount: 15,
    createdAt: "2024-01-15T09:15:00Z",
  },
]

// Cleanup function
function cleanup() {
  // Implement cleanup logic here
}

export async function GET(request: NextRequest) {
  try {
    cleanup() // Cleanup call at the beginning

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Search collections (case-insensitive)
    const results = collections
      .filter(
        (collection) =>
          collection.username.toLowerCase().includes(query.toLowerCase()) ||
          collection.section.toLowerCase().includes(query.toLowerCase()) ||
          collection.department.toLowerCase().includes(query.toLowerCase()) ||
          collection.faculty.toLowerCase().includes(query.toLowerCase()) ||
          collection.batch.includes(query),
      )
      .map((collection) => ({
        username: collection.username,
        section: collection.section,
        batch: collection.batch,
        faculty: collection.faculty,
        department: collection.department,
        teamCount: collection.teamCount,
        createdAt: collection.createdAt,
      }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching collections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
