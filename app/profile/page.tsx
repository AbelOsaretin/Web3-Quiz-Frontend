"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, User, Trophy } from "lucide-react";

const userRewards = {
  data: [
    {
      id: 1,
      created_at: "2025-11-03T10:00:00+00:00",
      User_ID: "U001",
      User_Wallet_Address: "0xABC...",
      Reward_Amount: 1000,
      Quiz_Attempt_ID: null,
      Raw_Claim_ID: null,
      Signature: null,
      Status: "Unclaimed",
    },
    {
      id: 2,
      created_at: "2025-11-03T10:05:00+00:00",
      User_ID: "U002",
      User_Wallet_Address: "0xDEF...",
      Reward_Amount: 1500,
      Quiz_Attempt_ID: null,
      Raw_Claim_ID: null,
      Signature: null,
      Status: "Claimed",
    },
    // ... up to 10 rows
  ],
};

const userQuizHistory = {
  data: [
    {
      id: 1,
      created_at: "2025-11-03T10:15:00+00:00",
      User_ID: "U001",
      Quiz_Attempt_ID: "ATTEMPT_123",
      Total_Passed: 1,
      Total_Failed: 9,
      Failed_Questions_Text: "Question 2, 3, 4, 5, 6, 7, 8, 9, 10",
      Failed_Question_ID: "Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10",
      Quiz_Category: "Blockchain Basics",
      Total_Question: 10,
    },
    {
      id: 2,
      created_at: "2025-11-03T10:20:00+00:00",
      User_ID: "U002",
      Quiz_Attempt_ID: "ATTEMPT_456",
      Total_Passed: 8,
      Total_Failed: 2,
      Failed_Questions_Text: "Question 1, 4",
      Failed_Question_ID: "Q1,Q4",
      Quiz_Category: "Smart Contracts",
      Total_Question: 10,
    },
    {
      id: 3,
      created_at: "2025-11-03T10:25:00+00:00",
      User_ID: "U003",
      Quiz_Attempt_ID: "ATTEMPT_789",
      Total_Passed: 10,
      Total_Failed: 0,
      Failed_Questions_Text: null,
      Failed_Question_ID: null,
      Quiz_Category: "DeFi",
      Total_Question: 10,
    },
  ],
};

const userData = {
  name: "Alex",
  email: "alex@example.com",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">CRYPTO BRAINZ</h1>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/categories" className="font-medium hover:text-primary">
              Categories
            </Link>
            {/* <Link
              href="/leaderboard"
              className="font-medium hover:text-primary"
            >
              Leaderboard
            </Link> */}
            <Link href="/profile" className="font-medium text-primary">
              Profile
            </Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-card rounded-xl p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/categories">
                  <Button>Start New Quiz</Button>
                </Link>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b mb-8">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "history"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("history")}
              >
                Quiz History
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "achievements"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("achievements")}
              >
                Achievements
              </button>
            </div>

            {/* Tab Content */}

            {activeTab === "history" && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz History</CardTitle>
                  <CardDescription>All quizzes you've failed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userQuizHistory.data.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{quiz.Quiz_Category}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quiz.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">
                              {quiz.Total_Passed}/{quiz.Total_Question}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(
                                (quiz.Total_Passed / quiz.Total_Question) * 100
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline">Load More</Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "achievements" && (
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Reward</CardTitle>
                    <CardDescription>
                      You can only claim one reward.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {userRewards.data
                        ?.filter((reward) => reward.Status === "Unclaimed") // 👈 Only show unclaimed rewards
                        .map((reward) => (
                          <div
                            key={reward.id}
                            className="bg-muted/50 rounded-lg p-4 text-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">
                              ${reward.Reward_Amount}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned on{" "}
                              {new Date(reward.created_at).toLocaleDateString()}
                            </p>
                            <br />
                            <Button
                              onClick={() =>
                                console.log(
                                  reward.User_ID,
                                  reward.Quiz_Attempt_ID,
                                  reward.Reward_Amount,
                                  reward.Raw_Claim_ID,
                                  reward.Signature
                                )
                              }
                            >
                              Get Reward
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Claimed Rewards</CardTitle>
                    <CardDescription>Rewards you've claimed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {userRewards.data
                        ?.filter((reward) => reward.Status === "Claimed") // 👈 Only show unclaimed rewards
                        .map((reward) => (
                          <div
                            key={reward.id}
                            className="bg-muted/50 rounded-lg p-4 text-center opacity-60"
                          >
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">
                              {reward.Reward_Amount}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Claimed
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-muted/30 border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CRYPTO BRAINZ</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} CRYPTO BRAINZ. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
