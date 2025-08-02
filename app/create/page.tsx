"use client";

import type React from "react";

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
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const faculties = {
  "Faculty of Science and Information Technology (FSIT)": [
    "Computer Science & Engineering (CSE)",
    "Computing & Information System (CIS)",
    "Software Engineering (SWE)",
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

const batches = ["2020", "2021", "2022", "2023", "2024", "2025"];

export default function CreateBoxPage() {
  const [formData, setFormData] = useState({
    courseCode: "",
    batch: "",
    faculty: "",
    department: "",
    teamCount: "",
    password: "",
    creatorEmail: "",
  });
  const [createdBox, setCreatedBox] = useState<{
    username: string;
    shareLink: string;
    qrCode: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log(formData);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedBox(data);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  if (createdBox) {
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
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600">
                Collection Created Successfully!
              </CardTitle>
              <CardDescription>
                Your slide collection is ready. Share the details below with
                your classmates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Collection ID</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={createdBox.username} readOnly />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdBox.username)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={createdBox.shareLink} readOnly />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdBox.shareLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src={`/api/qr?text=${encodeURIComponent(
                      createdBox.shareLink
                    )}`}
                    alt="QR Code for sharing"
                    className="w-32 h-32 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    QR Code for easy sharing
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button asChild className="flex-1">
                  <Link href={`/box/${createdBox.username}`}>
                    Go to Collection
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 bg-transparent"
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
            <CardTitle>Create Slide Collection</CardTitle>
            <CardDescription>
              Set up a new slide collection for your class section to collect
              presentation slide links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="section">Section/Course Code *</Label>
                <Input
                  id="section"
                  placeholder="e.g., CS101, EEE201"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="batch">Batch *</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, batch: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch year" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
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
                      faculties[
                        formData.faculty as keyof typeof faculties
                      ]?.map((dept) => (
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
                <Label htmlFor="password">Box Password *</Label>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Slide Collection"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
