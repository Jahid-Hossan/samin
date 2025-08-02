import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Submission } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { username } = params

    const collection = await db.collection("collections").findOne({ username })
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const submissions = await db.collection("submissions").find({ collectionId: collection._id.toString() }).toArray()

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { username } = params
    const body = await request.json()
    const { teamName, slideLink, leaderEmail } = body

    if (!teamName || !slideLink) {
      return NextResponse.json({ error: "Team name and slide link are required" }, { status: 400 })
    }

    const collection = await db.collection("collections").findOne({ username })
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Check if team already submitted
    const existingSubmission = await db.collection("submissions").findOne({
      collectionId: collection._id.toString(),
      teamName: { $regex: new RegExp(`^${teamName}$`, "i") },
    })

    if (existingSubmission) {
      return NextResponse.json({ error: "This team has already submitted slides" }, { status: 409 })
    }

    // Validate slide link format
    const validDomains = ["drive.google.com", "onedrive.live.com", "docs.google.com"]
    const isValidLink = validDomains.some((domain) => slideLink.includes(domain))

    if (!isValidLink) {
      return NextResponse.json({ error: "Please use a valid Google Drive or OneDrive link" }, { status: 400 })
    }

    // Create submission
    const newSubmission: Submission = {
      collectionId: collection._id.toString(),
      teamName,
      slideLink,
      leaderEmail: leaderEmail || undefined,
      submittedAt: new Date(),
    }

    const result = await db.collection("submissions").insertOne(newSubmission)

    return NextResponse.json({
      success: true,
      submission: { ...newSubmission, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
