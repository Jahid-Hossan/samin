import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { validateAdminAuth } from "@/lib/utils"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get("authorization")
    if (!validateAdminAuth(authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const { id } = params

    // Find the collection first
    const collection = await db.collection("collections").findOne({ _id: new ObjectId(id) })
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Remove all associated submissions
    await db.collection("submissions").deleteMany({ collectionId: id })

    // Remove the collection
    await db.collection("collections").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      message: `Collection ${collection.username} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
