import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { username } = params

    const collection = await db.collection("collections").findOne({ username }, { projection: { password: 0 } })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
