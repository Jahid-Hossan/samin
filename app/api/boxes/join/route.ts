import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

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
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6", // "password123"
    creatorEmail: null,
    createdAt: "2024-01-15T10:30:00Z",
  },
]

export async function POST(request: NextRequest) {
  try {
    // Cleanup call
    console.log("Cleaning up resources...")

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Find collection
    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, collection.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
