import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock collections - In production, use MongoDB
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
  {
    _id: "2",
    username: "EEE201-2024-EEE",
    section: "EEE201",
    batch: "2024",
    faculty: "Faculty of Engineering (FE)",
    department: "Electrical & Electronic Engineering (EEE)",
    teamCount: 15,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-15T09:15:00Z",
  },
  {
    _id: "3",
    username: "BBA101-2024-BBA",
    section: "BBA101",
    batch: "2024",
    faculty: "Faculty of Business and Entrepreneurship (FBE)",
    department: "Business Administration (BBA)",
    teamCount: 20,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-14T16:20:00Z",
  },
  {
    _id: "4",
    username: "SWE301-2023-SWE",
    section: "SWE301",
    batch: "2023",
    faculty: "Faculty of Science and Information Technology (FSIT)",
    department: "Software Engineering (SWE)",
    teamCount: 8,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-14T14:10:00Z",
  },
  {
    _id: "5",
    username: "LAW201-2024-LAW",
    section: "LAW201",
    batch: "2024",
    faculty: "Faculty of Humanities and Social Sciences (FHSS)",
    department: "Law (LAW)",
    teamCount: 15,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-14T12:30:00Z",
  },
]

// Admin credentials
const ADMIN_USERNAME = "SlideLinkAdmin"
const ADMIN_PASSWORD = "efGxXBLVZADoWDPp"

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
  {
    _id: "3",
    boxId: "2",
    teamName: "Circuit Masters",
    slideLink: "https://drive.google.com/example3",
    submittedAt: "2024-01-15T10:00:00Z",
  },
]

// Auto-cleanup function - remove collections older than 24 hours
const cleanupOldCollections = () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const initialLength = collections.length

  for (let i = collections.length - 1; i >= 0; i--) {
    if (new Date(collections[i].createdAt) < twentyFourHoursAgo) {
      const collectionId = collections[i]._id
      // Remove associated submissions
      for (let j = submissions.length - 1; j >= 0; j--) {
        if (submissions[j].boxId === collectionId) {
          submissions.splice(j, 1)
        }
      }
      // Remove the collection
      collections.splice(i, 1)
    }
  }

  if (collections.length < initialLength) {
    console.log(`Cleaned up ${initialLength - collections.length} expired collections`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up expired collections
    cleanupOldCollections()

    const { section, batch, faculty, department, teamCount, password, creatorEmail } = await request.json()

    // Validate required fields
    if (!section || !batch || !faculty || !department || !teamCount || !password) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Generate username using department abbreviation
    const deptAbbr = department.match(/$$([^)]+)$$/)?.[1] || department.split(" ")[0].toUpperCase()
    const username = `${section.toUpperCase()}-${batch}-${deptAbbr}`

    // Check if collection already exists
    const existingCollection = collections.find((collection) => collection.username === username)
    if (existingCollection) {
      return NextResponse.json({ error: "A collection with this combination already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create collection
    const newCollection = {
      _id: Date.now().toString(),
      username,
      section,
      batch,
      faculty,
      department,
      teamCount: Number.parseInt(teamCount),
      password: hashedPassword,
      creatorEmail: creatorEmail || null,
      createdAt: new Date().toISOString(),
    }

    collections.push(newCollection)

    // Generate share link
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/collection/${username}?password=${password}`

    return NextResponse.json({
      username,
      shareLink,
      qrCode: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="12">QR Code</text></svg>`,
    })
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    // Clean up expired collections
    cleanupOldCollections()

    // Return all collections for admin
    const collectionsWithStats = collections.map((collection) => {
      const collectionSubmissions = submissions.filter((s) => s.boxId === collection._id)
      return {
        ...collection,
        password: undefined, // Don't send password hash
        submissionCount: collectionSubmissions.length,
        submissions: collectionSubmissions,
      }
    })

    return NextResponse.json({
      collections: collectionsWithStats,
      totalCollections: collections.length,
      totalSubmissions: submissions.length,
    })
  } catch (error) {
    console.error("Error fetching admin data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
