import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Eye, Clock, Trash2, ExternalLink } from "lucide-react"

// This would come from API in real implementation
const recentCollections = [
  {
    username: "CS101-2024-CSE",
    section: "CS101",
    faculty: "Faculty of Science and Information Technology (FSIT)",
    department: "Computer Science & Engineering (CSE)",
    batch: "2024",
    teamCount: 12,
    submissions: 8,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    username: "EEE201-2024-EEE",
    section: "EEE201",
    faculty: "Faculty of Engineering (FE)",
    department: "Electrical & Electronic Engineering (EEE)",
    batch: "2024",
    teamCount: 15,
    submissions: 12,
    createdAt: "2024-01-15T09:15:00Z",
  },
  {
    username: "BBA101-2024-BBA",
    section: "BBA101",
    faculty: "Faculty of Business and Entrepreneurship (FBE)",
    department: "Business Administration (BBA)",
    batch: "2024",
    teamCount: 20,
    submissions: 15,
    createdAt: "2024-01-14T16:20:00Z",
  },
  {
    username: "NFE301-2023-NFE",
    section: "NFE301",
    faculty: "Faculty of Health and Life Sciences (FHLS)",
    department: "Nutrition & Food Engineering (NFE)",
    batch: "2023",
    teamCount: 10,
    submissions: 10,
    createdAt: "2024-01-14T14:10:00Z",
  },
  {
    username: "LAW201-2024-LAW",
    section: "LAW201",
    faculty: "Faculty of Humanities and Social Sciences (FHSS)",
    department: "Law (LAW)",
    batch: "2024",
    teamCount: 8,
    submissions: 6,
    createdAt: "2024-01-14T12:30:00Z",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SlideLink</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#collections" className="text-gray-600 hover:text-gray-900 transition-colors">
                Recent Collections
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Button asChild>
                <Link href="/create">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button asChild size="sm">
                <Link href="/create">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Share Presentation Slides
              <span className="text-blue-600 block">Effortlessly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Transform chaotic Excel sheets into organized slide collections. Perfect for university classes, team
              presentations, and academic collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/create">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Collection
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                <Link href="/join">
                  <Users className="w-5 h-5 mr-2" />
                  Join Collection
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose SlideLink?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for academic environments with simplicity and efficiency in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-gray-600">Create slide collections in under 30 seconds with our intuitive interface</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accounts</h3>
              <p className="text-gray-600">Simple password-based access means no complex registration process</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">See submissions as they come in with live updates and notifications</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Cleanup</h3>
              <p className="text-gray-600">Collections auto-delete after 24 hours to keep things organized</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Collections */}
      <section id="collections" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Collections</h2>
              <p className="text-xl text-gray-600">See what's happening across different classes and departments</p>
            </div>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                View All
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCollections.map((collection) => (
              <Card key={collection.username} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{collection.username}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {collection.submissions}/{collection.teamCount}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {collection.section} • {collection.department}
                    <br />
                    <span className="text-xs text-gray-500">{collection.faculty}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Batch {collection.batch}</span>
                    <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/box/${collection.username}`}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students and instructors who have simplified their presentation workflow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/create">Create Your First Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                <Link href="mailto:support@slidelink.com">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <span className="text-xl font-bold">SlideLink</span>
              </div>
              <p className="text-gray-400 mb-4">
                Streamlining presentation sharing for academic institutions worldwide.
              </p>
              <p className="text-sm text-gray-500">© 2024 SlideLink. All rights reserved.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/create" className="hover:text-white transition-colors">
                    Create Collection
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="hover:text-white transition-colors">
                    Join Collection
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-white transition-colors">
                    Search Collections
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="mailto:support@slidelink.com" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
