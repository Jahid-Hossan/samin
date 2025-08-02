import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { cleanupOldCollections } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    await cleanupOldCollections(db)

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const searchRegex = new RegExp(q, "i")

    const results = await db
      .collection("collections")
      .find({
        $or: [
          { username: searchRegex },
          { section: searchRegex },
          { courseCode: searchRegex },
          { department: searchRegex },
          { faculty: searchRegex },
          { semester: searchRegex },
        ],
      })
      .project({
        username: 1,
        section: 1,
        courseCode: 1,
        semester: 1,
        faculty: 1,
        department: 1,
        teamCount: 1,
        createdAt: 1,
      })
      .toArray()

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching collections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
