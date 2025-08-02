import { type NextRequest, NextResponse } from "next/server"

// Mock database - In production, use MongoDB
const boxes: any[] = []
const submissions: any[] = []

export async function DELETE(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    // Find collection
    const collectionIndex = boxes.findIndex((b) => b.username === username)
    if (collectionIndex === -1) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const collection = boxes[collectionIndex]

    // Remove all associated submissions
    for (let i = submissions.length - 1; i >= 0; i--) {
      if (submissions[i].boxId === collection._id) {
        submissions.splice(i, 1)
      }
    }

    // Remove the collection
    boxes.splice(collectionIndex, 1)

    return NextResponse.json({ success: true, message: "Collection deleted successfully" })
  } catch (error) {
    console.error("Error deleting collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
