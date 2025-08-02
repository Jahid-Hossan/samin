"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const faculties = {
  "Faculty of Science and Information Technology (FSIT)": [
    "Computer Science & Engineering (CSE)",
    "Software Engineering (SWE)",
    "Computing & Information System (CIS)",
    "Environmental Science and Disaster Management (ESDM)",
    "Multimedia & Creative Technology (MCT)",
    "Information Technology and Management (ITM)",
    "Physical Education & Sports Science (PESS)",
  ],
  "Faculty of Engineering (FE)": [
    "Information and Communication Engineering (ICE)",
    "Textile Engineering (TE)",
    "Electrical & Electronic Engineering (EEE)",
    "Architecture (ARCH)",
    "Civil Engineering (CE)",
  ],
  "Faculty of Business and Entrepreneurship (FBE)": [
    "Business Administration (BBA)",
    "Management (MGT)",
    "Real Estate (RE)",
    "Tourism & Hospitality Management (THM)",
    "Innovation & Entrepreneurship (IE)",
    "Finance and Banking (FB)",
    "Accounting (ACC)",
    "Marketing (MKT)",
  ],
  "Faculty of Health and Life Sciences (FHLS)": [
    "Pharmacy (PHARM)",
    "Public Health (PH)",
    "Nutrition & Food Engineering (NFE)",
    "Agricultural Science (AGS)",
    "Genetic Engineering and Biotechnology (GEB)",
  ],
  "Faculty of Humanities and Social Sciences (FHSS)": [
    "English (ENG)",
    "Law (LAW)",
    "Journalism & Mass Communication (JMC)",
    "Development Studies (DS)",
    "Information Science and Library Management (ISLM)",
  ],
};

const semesters = ["Spring 2025", "Summer 2025", "Fall 2025"];

export default function CreateCollectionPage() {
  const [formData, setFormData] = useState({
    section: "",
    courseCode: "",
    semester: "Summer 2025",
    faculty: "",
    department: "",
    teamCount: "",
    password: "",
    creatorEmail: "",
  });
  const [createdCollection, setCreatedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:3000"}/api/collections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCreatedCollection(data);
        toast({
          title: "Success!",
          description: "Slide collection created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create collection",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const downloadQR = () => {
    if (createdCollection) {
      const link = document.createElement("a");
      link.href = createdCollection.qrCode;
      link.download = `${createdCollection.username}-qr.png`;
      link.click();
    }
  };

  if (createdCollection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">
                Collection Created Successfully!
              </CardTitle>
              <CardDescription className="text-blue-100">
                Your slide collection is ready. Share the details below with
                your classmates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label className="text-sm font-medium">Collection ID</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={createdCollection.username}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdCollection.username)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={createdCollection.shareLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdCollection.shareLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white p-6 rounded-lg inline-block shadow-inner">
                  <img
                    src={createdCollection.qrCode || "/placeholder.svg"}
                    alt="QR Code for sharing"
                    className="w-40 h-40 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mt-3">
                    QR Code for easy sharing
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadQR}
                    className="mt-2 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download QR
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href={`/collection/${createdCollection.username}`}>
                    Go to Collection
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 border-2 border-blue-200 hover:bg-blue-50 bg-transparent"
                >
                  <Link href="/create">Create Another</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl">
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
            <CardTitle>Create Slide Collection</CardTitle>
            <CardDescription className="text-blue-100">
              Set up a new slide collection for your class section to collect
              presentation slide links.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  placeholder="e.g., 42-E, 65-A, 30-B"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., SE112, CSE101, EEE201"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="faculty">Faculty *</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      faculty: value,
                      department: "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(faculties).map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                  disabled={!formData.faculty}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.faculty
                          ? "Select department"
                          : "Select faculty first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.faculty &&
                      faculties[formData.faculty]?.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teamCount">Number of Teams *</Label>
                <Input
                  id="teamCount"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="e.g., 10"
                  value={formData.teamCount}
                  onChange={(e) =>
                    setFormData({ ...formData, teamCount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Collection Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6-12 characters"
                  minLength={6}
                  maxLength={12}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="creatorEmail">Creator Email (Optional)</Label>
                <Input
                  id="creatorEmail"
                  type="email"
                  placeholder="For password recovery"
                  value={formData.creatorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorEmail: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Slide Collection"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
