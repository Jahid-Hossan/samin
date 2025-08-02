import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import bcrypt from "bcryptjs"

// Helper function to generate collection username
export const generateUsername = (section: string, courseCode: string, semester: string, department: string): string => {
  const year = semester.split(" ")[1]
  let deptCode = department.match(/$$([^)]+)$$$/)?.[1] || department.split(" ")[0].toUpperCase()

  // Special handling for Computer Science/Software Engineering
  if (department.includes("Computer Science") || department.includes("Software Engineering")) {
    deptCode = department.includes("Software Engineering") ? "SWE" : "CSE"
  }

  return `${section}-${courseCode}-${year}-${deptCode}`
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// Admin credentials
export const ADMIN_USERNAME = "SlideLinkAdmin"
export const ADMIN_PASSWORD = "efGxXBLVZADoWDPp"

// Validate admin credentials
export const validateAdminAuth = (authHeader: string | undefined): boolean => {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false
  }

  const base64Credentials = authHeader.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Auto-cleanup function
export const cleanupOldCollections = async (db: any) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  try {
    // Find expired collections
    const expiredCollections = await db
      .collection("collections")
      .find({ createdAt: { $lt: twentyFourHoursAgo } })
      .toArray()

    if (expiredCollections.length > 0) {
      const expiredIds = expiredCollections.map((c: any) => c._id.toString())

      // Remove associated submissions
      await db.collection("submissions").deleteMany({
        collectionId: { $in: expiredIds },
      })

      // Remove expired collections
      const result = await db.collection("collections").deleteMany({
        createdAt: { $lt: twentyFourHoursAgo },
      })

      console.log(`Cleaned up ${result.deletedCount} expired collections`)
    }
  } catch (error) {
    console.error("Error during cleanup:", error)
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
