import type { Collection } from "@/lib/models";
import { connectToDatabase } from "@/lib/mongodb";
import {
  cleanupOldCollections,
  generateUsername,
  hashPassword,
} from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    await cleanupOldCollections(db);

    const body = await request.json();
    const {
      batch,
      creatorEmail,
      department,
      faculty,
      password,
      courseCode,
      teamCount,
    } = body;

    console.log({
      batch,
      creatorEmail,
      department,
      faculty,
      password,
      courseCode,
      teamCount,
    });

    if (
      !batch ||
      !creatorEmail ||
      !department ||
      !faculty ||
      !password ||
      !courseCode ||
      !teamCount
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const username = generateUsername(courseCode, batch, department);

    // Check if collection already exists
    const existingCollection = await db
      .collection("collections")
      .findOne({ username });
    if (existingCollection) {
      return NextResponse.json(
        { error: "A collection with this combination already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create collection
    const newCollection: Collection = {
      username,
      courseCode,
      batch,
      faculty,
      department,
      teamCount: Number.parseInt(teamCount),
      password: hashedPassword,
      creatorEmail: creatorEmail || undefined,
      createdAt: new Date(),
    };

    const result = await db.collection("collections").insertOne(newCollection);

    // Generate share link
    const shareLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/collection/${username}?password=${password}`;

    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(shareLink, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      username,
      shareLink,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
