import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { ContactMessage } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Save contact message to database
    const contactMessage: ContactMessage = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
    }

    await db.collection("contact_messages").insertOne(contactMessage)

    // In production, you can add email sending logic here using nodemailer
    console.log("Contact form submission:", { name, email, subject, message })

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
