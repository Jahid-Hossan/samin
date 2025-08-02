const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const QRCode = require("qrcode")
const nodemailer = require("nodemailer")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Mock database - In production, use MongoDB
const collections = [
  {
    _id: "1",
    username: "42-E-SE112-2025-CSE",
    section: "42-E",
    courseCode: "SE112",
    semester: "Summer 2025",
    faculty: "Faculty of Science and Information Technology (FSIT)",
    department: "Computer Science & Engineering (CSE)",
    teamCount: 12,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6", // "password123"
    creatorEmail: null,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    username: "65-A-EEE201-2025-EEE",
    section: "65-A",
    courseCode: "EEE201",
    semester: "Summer 2025",
    faculty: "Faculty of Engineering (FE)",
    department: "Electrical & Electronic Engineering (EEE)",
    teamCount: 15,
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdwhYfQrXkgF0JQ0B2hoqyAdQeqG6",
    creatorEmail: null,
    createdAt: "2024-01-15T09:15:00Z",
  },
]

const submissions = [
  {
    _id: "1",
    collectionId: "1",
    teamName: "Team Alpha",
    slideLink: "https://drive.google.com/example1",
    leaderEmail: "alpha@example.com",
    submittedAt: "2024-01-15T11:00:00Z",
  },
  {
    _id: "2",
    collectionId: "1",
    teamName: "Team Beta",
    slideLink: "https://drive.google.com/example2",
    leaderEmail: "beta@example.com",
    submittedAt: "2024-01-15T11:30:00Z",
  },
]

// Admin credentials
const ADMIN_USERNAME = "SlideLinkAdmin"
const ADMIN_PASSWORD = "efGxXBLVZADoWDPp"

// Helper function to generate collection username
const generateUsername = (section, courseCode, semester, department) => {
  const year = semester.split(" ")[1]
  let deptCode = department.match(/$$([^)]+)$$/)?.[1] || department.split(" ")[0].toUpperCase()

  // Special handling for Computer Science/Software Engineering
  if (department.includes("Computer Science") || department.includes("Software Engineering")) {
    deptCode = department.includes("Software Engineering") ? "SWE" : "CSE"
  }

  return `${section}-${courseCode}-${year}-${deptCode}`
}

// Auto-cleanup function
const cleanupOldCollections = () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const initialLength = collections.length

  for (let i = collections.length - 1; i >= 0; i--) {
    if (new Date(collections[i].createdAt) < twentyFourHoursAgo) {
      const collectionId = collections[i]._id
      // Remove associated submissions
      for (let j = submissions.length - 1; j >= 0; j--) {
        if (submissions[j].collectionId === collectionId) {
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

// Routes

// Create collection
app.post("/api/collections", async (req, res) => {
  try {
    cleanupOldCollections()

    const { section, courseCode, semester, faculty, department, teamCount, password, creatorEmail } = req.body

    if (!section || !courseCode || !semester || !faculty || !department || !teamCount || !password) {
      return res.status(400).json({ error: "All required fields must be provided" })
    }

    const username = generateUsername(section, courseCode, semester, department)

    // Check if collection already exists
    const existingCollection = collections.find((c) => c.username === username)
    if (existingCollection) {
      return res.status(409).json({ error: "A collection with this combination already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create collection
    const newCollection = {
      _id: Date.now().toString(),
      username,
      section,
      courseCode,
      semester,
      faculty,
      department,
      teamCount: Number.parseInt(teamCount),
      password: hashedPassword,
      creatorEmail: creatorEmail || null,
      createdAt: new Date().toISOString(),
    }

    collections.push(newCollection)

    // Generate share link
    const shareLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/collection/${username}?password=${password}`

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(shareLink, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    res.json({
      username,
      shareLink,
      qrCode: qrCodeDataURL,
    })
  } catch (error) {
    console.error("Error creating collection:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Join collection
app.post("/api/collections/join", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    const isValidPassword = await bcrypt.compare(password, collection.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Error joining collection:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get collection details
app.get("/api/collections/:username", (req, res) => {
  try {
    const { username } = req.params

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    const { password, ...collectionData } = collection
    res.json(collectionData)
  } catch (error) {
    console.error("Error fetching collection:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get submissions for a collection
app.get("/api/collections/:username/submissions", (req, res) => {
  try {
    const { username } = req.params

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    const collectionSubmissions = submissions.filter((s) => s.collectionId === collection._id)
    res.json({ submissions: collectionSubmissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Submit slides
app.post("/api/collections/:username/submissions", (req, res) => {
  try {
    const { username } = req.params
    const { teamName, slideLink, leaderEmail } = req.body

    if (!teamName || !slideLink) {
      return res.status(400).json({ error: "Team name and slide link are required" })
    }

    const collection = collections.find((c) => c.username === username)
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    // Check if team already submitted
    const existingSubmission = submissions.find(
      (s) => s.collectionId === collection._id && s.teamName.toLowerCase() === teamName.toLowerCase(),
    )
    if (existingSubmission) {
      return res.status(409).json({ error: "This team has already submitted slides" })
    }

    // Validate slide link format
    const validDomains = ["drive.google.com", "onedrive.live.com", "docs.google.com"]
    const isValidLink = validDomains.some((domain) => slideLink.includes(domain))

    if (!isValidLink) {
      return res.status(400).json({ error: "Please use a valid Google Drive or OneDrive link" })
    }

    // Create submission
    const newSubmission = {
      _id: Date.now().toString(),
      collectionId: collection._id,
      teamName,
      slideLink,
      leaderEmail: leaderEmail || null,
      submittedAt: new Date().toISOString(),
    }

    submissions.push(newSubmission)

    res.json({ success: true, submission: newSubmission })
  } catch (error) {
    console.error("Error creating submission:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Search collections
app.get("/api/collections/search", (req, res) => {
  try {
    cleanupOldCollections()

    const { q } = req.query

    if (!q) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const results = collections
      .filter(
        (collection) =>
          collection.username.toLowerCase().includes(q.toLowerCase()) ||
          collection.section.toLowerCase().includes(q.toLowerCase()) ||
          collection.courseCode.toLowerCase().includes(q.toLowerCase()) ||
          collection.department.toLowerCase().includes(q.toLowerCase()) ||
          collection.faculty.toLowerCase().includes(q.toLowerCase()) ||
          collection.semester.includes(q),
      )
      .map((collection) => ({
        username: collection.username,
        section: collection.section,
        courseCode: collection.courseCode,
        semester: collection.semester,
        faculty: collection.faculty,
        department: collection.department,
        teamCount: collection.teamCount,
        createdAt: collection.createdAt,
      }))

    res.json({ results })
  } catch (error) {
    console.error("Error searching collections:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // In production, send email using nodemailer
    console.log("Contact form submission:", { name, email, subject, message })

    res.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error processing contact form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Admin routes
app.get("/api/admin/collections", (req, res) => {
  try {
    // Check for admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
    const [username, password] = credentials.split(":")

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    cleanupOldCollections()

    const collectionsWithStats = collections.map((collection) => {
      const collectionSubmissions = submissions.filter((s) => s.collectionId === collection._id)
      return {
        ...collection,
        password: undefined,
        submissionCount: collectionSubmissions.length,
        submissions: collectionSubmissions,
      }
    })

    res.json({
      collections: collectionsWithStats,
      totalCollections: collections.length,
      totalSubmissions: submissions.length,
    })
  } catch (error) {
    console.error("Error fetching admin data:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete collection (admin)
app.delete("/api/admin/collections/:id", (req, res) => {
  try {
    // Check for admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
    const [username, password] = credentials.split(":")

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const { id } = req.params

    const collectionIndex = collections.findIndex((c) => c._id === id)
    if (collectionIndex === -1) {
      return res.status(404).json({ error: "Collection not found" })
    }

    const collection = collections[collectionIndex]

    // Remove all associated submissions
    for (let i = submissions.length - 1; i >= 0; i--) {
      if (submissions[i].collectionId === collection._id) {
        submissions.splice(i, 1)
      }
    }

    // Remove the collection
    collections.splice(collectionIndex, 1)

    res.json({
      success: true,
      message: `Collection ${collection.username} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting collection:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`SlideLink Backend running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
