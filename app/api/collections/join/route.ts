import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { comparePassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const collection = await db.collection("collections").findOne({ username })
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const isValidPassword = await comparePassword(password, collection.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
