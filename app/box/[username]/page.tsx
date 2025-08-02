"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Eye, Plus, ExternalLink, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BoxData {
  username: string
  section: string
  batch: string
  department: string
  teamCount: number
  createdAt: string
}

interface Submission {
  _id: string
  teamName: string
  slideLink: string
  leaderEmail?: string
  submittedAt: string
}

export default function BoxPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params.username as string
  const password = searchParams.get("password")

  const [boxData, setBoxData] = useState<BoxData | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState(password || "")
  const [submissionData, setSubmissionData] = useState({
    teamName: "",
    slideLink: "",
    leaderEmail: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (password) {
      authenticateAndLoadData()
    }
  }, [username, password])

  const authenticateAndLoadData = async () => {
    try {
      const response = await fetch("/api/boxes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password || passwordInput,
        }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        await loadBoxData()
        await loadSubmissions()
      } else {
        const data = await response.json()
        toast({
          title: "Authentication Failed",
          description: data.error || "Invalid password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBoxData = async () => {
    try {
      const response = await fetch(`/api/boxes/${username}`)
      if (response.ok) {
        const data = await response.json()
        setBoxData(data)
      }
    } catch (error) {
      console.error("Failed to load box data:", error)
    }
  }

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`/api/boxes/${username}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error("Failed to load submissions:", error)
    }
  }

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/boxes/${username}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Slide link submitted successfully",
        })
        setSubmissionData({ teamName: "", slideLink: "", leaderEmail: "" })
        await loadSubmissions() // Refresh submissions
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredSubmissions = submissions.filter((submission) =>
    submission.teamName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-md">
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
              <CardTitle>Collection Access Required</CardTitle>
              <CardDescription>Enter the password to access {username}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  authenticateAndLoadData()
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter collection password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Access Collection
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Box Header */}
        {boxData && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{boxData.username}</CardTitle>
                  <CardDescription className="text-lg">
                    {boxData.section} • {boxData.department} • Batch {boxData.batch}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-sm">
                    {submissions.length}/{boxData.teamCount} teams submitted
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this slide collection? This action cannot be undone and all
                          submissions will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Collection</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Submit Slides
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              View Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Team's Slides</CardTitle>
                <CardDescription>Upload your presentation slides and share the link here</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmission} className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      placeholder="e.g., Team Alpha, Group 1"
                      maxLength={50}
                      value={submissionData.teamName}
                      onChange={(e) => setSubmissionData({ ...submissionData, teamName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slideLink">Slide Link *</Label>
                    <Input
                      id="slideLink"
                      type="url"
                      placeholder="https://drive.google.com/... or https://onedrive.live.com/..."
                      value={submissionData.slideLink}
                      onChange={(e) => setSubmissionData({ ...submissionData, slideLink: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Make sure your slide link is publicly accessible or shared with viewing permissions
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="leaderEmail">Team Leader Email (Optional)</Label>
                    <Input
                      id="leaderEmail"
                      type="email"
                      placeholder="leader@example.com"
                      value={submissionData.leaderEmail}
                      onChange={(e) => setSubmissionData({ ...submissionData, leaderEmail: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Slide Link
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Submissions</CardTitle>
                    <CardDescription>View all submitted presentation slides</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{submissions.length === 0 ? "No submissions yet" : "No teams match your search"}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-medium">{submission.teamName}</h3>
                          {submission.leaderEmail && <p className="text-sm text-gray-600">{submission.leaderEmail}</p>}
                          <p className="text-xs text-gray-500">
                            Submitted {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <a href={submission.slideLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Slides
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
