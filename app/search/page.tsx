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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SearchResult {
  username: string;
  section: string;
  batch: string;
  department: string;
  teamCount: number;
  createdAt: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBox, setSelectedBox] = useState<SearchResult | null>(null);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/collections/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          toast({
            title: "No Results",
            description: "No slide collections found matching your search",
          });
        }
      } else {
        toast({
          title: "Search Failed",
          description: data.error || "Unable to find slide collections",
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

  const handleAccessBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBox) return;

    try {
      const response = await fetch("/api/collections/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedBox.username,
          password: password,
        }),
      });

      if (response.ok) {
        window.open(
          `/box/${selectedBox.username}?password=${password}`,
          "_blank"
        );
      } else {
        const data = await response.json();
        toast({
          title: "Access Denied",
          description: data.error || "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search Slide Collections
              </CardTitle>
              <CardDescription>
                Search by collection ID, section, department, or batch year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Query</Label>
                  <Input
                    id="search"
                    placeholder="e.g., CS101, Computer Science, 2023"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-gray-900">Search Results</h3>
                  {searchResults.map((result) => (
                    <div
                      key={result.username}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBox?.username === result.username
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedBox(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{result.username}</p>
                          <p className="text-sm text-gray-600">
                            {result.section} • {result.department}
                          </p>
                          <p className="text-xs text-gray-500">
                            Batch {result.batch} • {result.teamCount} teams
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {result.teamCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Access Collection
              </CardTitle>
              <CardDescription>
                Select a collection from search results and enter the password
                to access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBox ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedBox.username}</p>
                    <p className="text-sm text-gray-600">
                      {selectedBox.section} • {selectedBox.department}
                    </p>
                    <p className="text-xs text-gray-500">
                      Batch {selectedBox.batch} • {selectedBox.teamCount} teams
                    </p>
                  </div>

                  <form onSubmit={handleAccessBox} className="space-y-4">
                    <div>
                      <Label htmlFor="accessPassword">Password</Label>
                      <Input
                        id="accessPassword"
                        type="password"
                        placeholder="Enter collection password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Access Collection
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a collection from search results to access it</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
