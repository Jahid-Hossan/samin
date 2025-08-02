const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const QRCode = require("qrcode")
const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// MongoDB connection
let db
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/slidelink"

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log("Connected to MongoDB")
    db = client.db()
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

// Middleware
app.use(cors())
app.use(express.json())

// Admin credentials
const ADMIN_USERNAME = "SlideLinkAdmin"
const ADMIN_PASSWORD = "efGxXBLVZADoWDPp"

// Helper function to generate collection username
const generateUsername = (section, courseCode, semester, department) => {
  const year = semester.split(" ")[1]
  let deptCode = department.match(/$$([^)]+)$$$/)?.[1] || department.split(" ")[0].toUpperCase()

  // Special handling for Computer Science/Software Engineering
  if (department.includes("Computer Science") || department.includes("Software Engineering")) {
    deptCode = department.includes("Software Engineering") ? "SWE" : "CSE"
  }

  return `${section}-${courseCode}-${year}-${deptCode}`
}

// Auto-cleanup function
const cleanupOldCollections = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find expired collections
    const expiredCollections = await db
      .collection("collections")
      .find({
        createdAt: { $lt: twentyFourHoursAgo },
      })
      .toArray()

    if (expiredCollections.length > 0) {
      const expiredIds = expiredCollections.map((c) => c._id)

      // Remove associated submissions
      await db.collection("submissions").deleteMany({
        collectionId: { $in: expiredIds },
      })

      // Remove expired collections
      await db.collection("collections").deleteMany({
        _id: { $in: expiredIds },
      })

      console.log(`Cleaned up ${expiredCollections.length} expired collections`)
    }
  } catch (error) {
    console.error("Cleanup error:", error)
  }
}

// Routes

// Create collection
app.post("/api/collections", async (req, res) => {
  try {
    await cleanupOldCollections()

    const { section, courseCode, semester, faculty, department, teamCount, password, creatorEmail } = req.body

    if (!section || !courseCode || !semester || !faculty || !department || !teamCount || !password) {
      return res.status(400).json({ error: "All required fields must be provided" })
    }

    const username = generateUsername(section, courseCode, semester, department)

    // Check if collection already exists
    const existingCollection = await db.collection("collections").findOne({ username })
    if (existingCollection) {
      return res.status(409).json({ error: "A collection with this combination already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create collection
    const newCollection = {
      username,
      section,
      courseCode,
      semester,
      faculty,
      department,
      teamCount: Number.parseInt(teamCount),
      password: hashedPassword,
      creatorEmail: creatorEmail || null,
      createdAt: new Date(),
    }

    const result = await db.collection("collections").insertOne(newCollection)

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

    const collection = await db.collection("collections").findOne({ username })
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
app.get("/api/collections/:username", async (req, res) => {
  try {
    const { username } = req.params

    const collection = await db.collection("collections").findOne({ username })
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
app.get("/api/collections/:username/submissions", async (req, res) => {
  try {
    const { username } = req.params

    const collection = await db.collection("collections").findOne({ username })
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    const submissions = await db
      .collection("submissions")
      .find({
        collectionId: collection._id,
      })
      .toArray()

    res.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Submit slides
app.post("/api/collections/:username/submissions", async (req, res) => {
  try {
    const { username } = req.params
    const { teamName, slideLink, leaderEmail } = req.body

    if (!teamName || !slideLink) {
      return res.status(400).json({ error: "Team name and slide link are required" })
    }

    const collection = await db.collection("collections").findOne({ username })
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    // Check if team already submitted
    const existingSubmission = await db.collection("submissions").findOne({
      collectionId: collection._id,
      teamName: { $regex: new RegExp(`^${teamName}$`, "i") },
    })
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
      collectionId: collection._id,
      teamName,
      slideLink,
      leaderEmail: leaderEmail || null,
      submittedAt: new Date(),
    }

    const result = await db.collection("submissions").insertOne(newSubmission)

    res.json({ success: true, submission: { ...newSubmission, _id: result.insertedId } })
  } catch (error) {
    console.error("Error creating submission:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Search collections
app.get("/api/collections/search", async (req, res) => {
  try {
    await cleanupOldCollections()

    const { q } = req.query

    if (!q) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const searchRegex = new RegExp(q, "i")
    const collections = await db
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
      .toArray()

    const results = collections.map((collection) => ({
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

    // Store contact message in database
    const contactMessage = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
    }

    await db.collection("contacts").insertOne(contactMessage)

    res.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error processing contact form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Admin routes
app.get("/api/admin/collections", async (req, res) => {
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

    await cleanupOldCollections()

    const collections = await db.collection("collections").find({}).toArray()
    const submissions = await db.collection("submissions").find({}).toArray()

    const collectionsWithStats = collections.map((collection) => {
      const collectionSubmissions = submissions.filter((s) => s.collectionId.toString() === collection._id.toString())
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
app.delete("/api/admin/collections/:id", async (req, res) => {
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

    const collection = await db.collection("collections").findOne({ _id: new ObjectId(id) })
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" })
    }

    // Remove all associated submissions
    await db.collection("submissions").deleteMany({ collectionId: new ObjectId(id) })

    // Remove the collection
    await db.collection("collections").deleteOne({ _id: new ObjectId(id) })

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
