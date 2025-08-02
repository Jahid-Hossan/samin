"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function JoinBoxPage() {
  const [joinData, setJoinData] = useState({
    collectionId: "",
    password: "",
  })
  const [shareLink, setShareLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleJoinByUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/collections/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/collection/${joinData.collectionId}?password=${joinData.password}`)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join collection",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinByLink = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = new URL(shareLink)
      const pathParts = url.pathname.split("/")
      const collectionId = pathParts[pathParts.length - 1]
      const password = url.searchParams.get("password")

      if (collectionId && password) {
        router.push(`/collection/${collectionId}?password=${password}`)
      } else {
        toast({
          title: "Invalid Link",
          description: "The share link appears to be invalid",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid share link",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join Slide Collection</CardTitle>
            <CardDescription>
              Enter the collection details or use a share link to join an existing slide collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="collectionId" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="collectionId">By Collection ID</TabsTrigger>
                <TabsTrigger value="link">By Share Link</TabsTrigger>
              </TabsList>

              <TabsContent value="collectionId">
                <form onSubmit={handleJoinByUsername} className="space-y-4">
                  <div>
                    <Label htmlFor="collectionId">Collection ID *</Label>
                    <Input
                      id="collectionId"
                      placeholder="e.g., CS101-2023-CSE"
                      value={joinData.collectionId}
                      onChange={(e) => setJoinData({ ...joinData, collectionId: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter collection password"
                      value={joinData.password}
                      onChange={(e) => setJoinData({ ...joinData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Joining..." : "Join Collection"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="link">
                <form onSubmit={handleJoinByLink} className="space-y-4">
                  <div>
                    <Label htmlFor="shareLink">Share Link *</Label>
                    <Input
                      id="shareLink"
                      placeholder="Paste the share link here"
                      value={shareLink}
                      onChange={(e) => setShareLink(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Join via Link
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
