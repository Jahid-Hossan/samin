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
]

// Cleanup call
function cleanup() {
  // Implement cleanup logic here
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    cleanup() // Cleanup call at the beginning

    const { username } = params

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Return collection data without password
    const { password, ...collectionData } = collection
    return NextResponse.json(collectionData)
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
