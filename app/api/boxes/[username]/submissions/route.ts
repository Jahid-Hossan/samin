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

const submissions: any[] = [
  {
    _id: "1",
    boxId: "1",
    teamName: "Team Alpha",
    slideLink: "https://drive.google.com/example1",
    submittedAt: "2024-01-15T11:00:00Z",
  },
  {
    _id: "2",
    boxId: "1",
    teamName: "Team Beta",
    slideLink: "https://drive.google.com/example2",
    submittedAt: "2024-01-15T11:30:00Z",
  },
]

function cleanup() {
  // Cleanup logic here
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    cleanup()
    const { username } = params

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const collectionSubmissions = submissions.filter((s) => s.boxId === collection._id)
    return NextResponse.json({ submissions: collectionSubmissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    cleanup()
    const { username } = params
    const { teamName, slideLink, leaderEmail } = await request.json()

    if (!teamName || !slideLink) {
      return NextResponse.json({ error: "Team name and slide link are required" }, { status: 400 })
    }

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Check if team already submitted
    const existingSubmission = submissions.find(
      (s) => s.boxId === collection._id && s.teamName.toLowerCase() === teamName.toLowerCase(),
    )
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
    const newSubmission = {
      _id: Date.now().toString(),
      boxId: collection._id,
      teamName,
      slideLink,
      leaderEmail: leaderEmail || null,
      submittedAt: new Date().toISOString(),
    }

    submissions.push(newSubmission)

    return NextResponse.json({ success: true, submission: newSubmission })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
