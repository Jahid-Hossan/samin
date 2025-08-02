"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Trash2, Eye, Search, BarChart3, Shield, Calendar } from "lucide-react"
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

interface Collection {
  _id: string
  username: string
  section: string
  batch: string
  faculty: string
  department: string
  teamCount: number
  submissionCount: number
  createdAt: string
  submissions: any[]
}

interface AdminStats {
  totalCollections: number
  totalSubmissions: number
  collections: Collection[]
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [adminData, setAdminData] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const authString = btoa(`${credentials.username}:${credentials.password}`)
      const response = await fetch("/api/boxes", {
        headers: {
          Authorization: `Basic ${authString}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAdminData(data)
        setIsAuthenticated(true)
        toast({
          title: "Login Successful",
          description: "Welcome to SlideLink Admin Dashboard",
        })
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials",
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

  const handleDeleteCollection = async (collectionId: string, username: string) => {
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
        },
      })

      if (response.ok) {
        // Refresh data
        const authString = btoa(`${credentials.username}:${credentials.password}`)
        const refreshResponse = await fetch("/api/boxes", {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setAdminData(data)
        }

        toast({
          title: "Collection Deleted",
          description: `${username} has been permanently deleted`,
        })
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete collection",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting",
        variant: "destructive",
      })
    }
  }

  const filteredCollections =
    adminData?.collections.filter(
      (collection) =>
        collection.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.faculty.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">SlideLink Admin</CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Admin Username</Label>
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Login to Admin Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SlideLink Admin</h1>
                <p className="text-sm text-gray-600">System Administration Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Admin: {credentials.username}</Badge>
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/">Back to Site</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData?.totalCollections || 0}</div>
              <p className="text-xs text-muted-foreground">Active slide collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">Slide submissions received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminData?.collections.length
                  ? Math.round(
                      (adminData.totalSubmissions / adminData.collections.reduce((sum, c) => sum + c.teamCount, 0)) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Teams submitted slides</p>
            </CardContent>
          </Card>
        </div>

        {/* Collections Management */}
        <Tabs defaultValue="collections" className="w-full">
          <TabsList>
            <TabsTrigger value="collections">Collections Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Collections</CardTitle>
                    <CardDescription>Manage all slide collections across the platform</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search collections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCollections.map((collection) => (
                    <div key={collection._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{collection.username}</h3>
                          <Badge variant="secondary">
                            {collection.submissionCount}/{collection.teamCount}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {collection.batch}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {collection.section} • {collection.department}
                        </p>
                        <p className="text-xs text-gray-500">{collection.faculty}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Created: {new Date(collection.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" asChild className="bg-transparent">
                          <Link href={`/box/${collection.username}`} target="_blank">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
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
                                Are you sure you want to permanently delete "{collection.username}"? This will remove
                                all {collection.submissionCount} submissions and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteCollection(collection._id, collection.username)}
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}

                  {filteredCollections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No collections found matching your search</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Distribution</CardTitle>
                  <CardDescription>Collections by faculty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      adminData?.collections.reduce(
                        (acc, collection) => {
                          const faculty = collection.faculty.split("(")[0].trim()
                          acc[faculty] = (acc[faculty] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ) || {},
                    ).map(([faculty, count]) => (
                      <div key={faculty} className="flex items-center justify-between">
                        <span className="text-sm">{faculty}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest collections created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData?.collections
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((collection) => (
                        <div key={collection._id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{collection.username}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(collection.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {collection.submissionCount}/{collection.teamCount}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
