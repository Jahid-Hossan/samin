"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Eye, Plus, ExternalLink, Search, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CollectionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params.username
  const password = searchParams.get("password")

  const [collectionData, setCollectionData] = useState(null)
  const [submissions, setSubmissions] = useState([])
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
      const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/collections/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password || passwordInput,
        }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        await loadCollectionData()
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

  const loadCollectionData = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/collections/${username}`)
      if (response.ok) {
        const data = await response.json()
        setCollectionData(data)
      }
    } catch (error) {
      console.error("Failed to load collection data:", error)
    }
  }

  const loadSubmissions = async () => {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:5000"}/api/collections/${username}/submissions`,
      )
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error("Failed to load submissions:", error)
    }
  }

  const handleSubmission = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:5000"}/api/collections/${username}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        },
      )

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Slide link submitted successfully",
        })
        setSubmissionData({ teamName: "", slideLink: "", leaderEmail: "" })
        await loadSubmissions()
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-md">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle>Collection Access Required</CardTitle>
              <CardDescription className="text-blue-100">Enter the password to access {username}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Collection Header */}
        {collectionData && (
          <Card className="mb-6 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{collectionData.username}</CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    <div className="space-y-1">
                      <div>
                        {collectionData.section} • {collectionData.courseCode}
                      </div>
                      <div className="text-blue-200 font-medium">{collectionData.semester}</div>
                      <div className="text-sm">{collectionData.department}</div>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30">
                    {submissions.length}/{collectionData.teamCount} teams submitted
                  </Badge>
                  <div className="text-right text-sm text-blue-100">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(collectionData.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      Auto-expires in 24h
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg">
            <TabsTrigger
              value="submit"
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Slides
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle>Submit Your Team's Slides</CardTitle>
                <CardDescription className="text-green-100">
                  Upload your presentation slides and share the link here
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Submit Slide Link
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Submissions</CardTitle>
                    <CardDescription className="text-purple-100">
                      View all submitted presentation slides
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-purple-200" />
                    <Input
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48 bg-white/20 border-white/30 text-white placeholder:text-purple-200"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">
                      {submissions.length === 0 ? "No submissions yet" : "No teams match your search"}
                    </p>
                    <p className="text-sm">Submissions will appear here once teams start uploading their slides</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-6 border rounded-xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{submission.teamName}</h3>
                          {submission.leaderEmail && (
                            <p className="text-sm text-blue-600 font-medium">{submission.leaderEmail}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Submitted {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
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
