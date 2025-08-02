import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { validateAdminAuth, cleanupOldCollections } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get("authorization")
    if (!validateAdminAuth(authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    await cleanupOldCollections(db)

    // Get all collections with submission counts
    const collections = await db
      .collection("collections")
      .aggregate([
        {
          $lookup: {
            from: "submissions",
            localField: "_id",
            foreignField: "collectionId",
            as: "submissions",
          },
        },
        {
          $addFields: {
            submissionCount: { $size: "$submissions" },
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ])
      .toArray()

    const totalSubmissions = await db.collection("submissions").countDocuments()

    return NextResponse.json({
      collections,
      totalCollections: collections.length,
      totalSubmissions,
    })
  } catch (error) {
    console.error("Error fetching admin data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
