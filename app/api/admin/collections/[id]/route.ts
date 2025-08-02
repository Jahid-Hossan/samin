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
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-15T10:30:00Z",
  },
]

const submissions: any[] = []

// Admin credentials
const ADMIN_USERNAME = "SlideLinkAdmin"
const ADMIN_PASSWORD = "efGxXBLVZADoWDPp"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
    const [username, password] = credentials.split(":")

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { id } = params

    // Find collection
    const collectionIndex = collections.findIndex((c) => c._id === id)
    if (collectionIndex === -1) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const collection = collections[collectionIndex]

    // Remove all associated submissions
    for (let i = submissions.length - 1; i >= 0; i--) {
      if (submissions[i].boxId === collection._id) {
        submissions.splice(i, 1)
      }
    }

    // Remove the collection
    collections.splice(collectionIndex, 1)

    return NextResponse.json({
      success: true,
      message: `Collection ${collection.username} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
