"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, ArrowRight, Clock, BarChart3 } from "lucide-react";
import AuthToggle from "@/components/AuthToggle";

export default function NewQuizPage() {
  const router = useRouter();
  // redirect to login if unauthenticated
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const { data } = await (
          await import("@/lib/supabaseClient")
        ).supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user && mounted) router.push("/login");
      } catch (e) {
        console.error("auth check failed:", e);
        if (mounted) router.push("/login");
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [router]);
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState(
    preselectedCategory || ""
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    preselectedCategory ? "medium" : "medium"
  );
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(30);

  const categories = [
    { id: "javascript", name: "JavaScript", icon: "JS" },
    { id: "python", name: "Python", icon: "PY" },
    { id: "java", name: "Java", icon: "JV" },
    { id: "csharp", name: "C#", icon: "C#" },
    { id: "cpp", name: "C++", icon: "C++" },
    { id: "ruby", name: "Ruby", icon: "RB" },
    { id: "go", name: "Go", icon: "GO" },
    { id: "typescript", name: "TypeScript", icon: "TS" },
  ];

  const difficulties = [
    {
      id: "easy",
      name: "Easy",
      // description: "Basic language concepts and syntax",
      icon: "🟢",
    },
    {
      id: "medium",
      name: "Medium",
      // description: "Intermediate programming challenges",
      icon: "🟡",
    },
    {
      id: "hard",
      name: "Hard",
      // description: "Advanced concepts and problem-solving",
    },
    // {
    //   id: "adaptive",
    //   name: "Adaptive",
    //   description: "Adjusts difficulty based on your performance",
    // },
  ];

  const questionCounts = [10, 15, 20];
  const timeLimits = [30, 60, 90, 120]; // 0 means no time limit

  const startQuiz = () => {
    if (!selectedCategory) {
      // Add validation feedback
      alert("Please select a category before starting the quiz");
      return;
    }

    // Add console logging for debugging
    console.log("Starting quiz with:", {
      category: selectedCategory,
      difficulty: selectedDifficulty,
      count: selectedQuestionCount,
      time: selectedTimeLimit,
    });

    router.push(
      `/quiz/play?category=${selectedCategory}&difficulty=${selectedDifficulty}&count=${selectedQuestionCount}&time=${selectedTimeLimit}`
    );
  };

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
            {/* <Link href="/leaderboard" className="font-medium hover:text-primary">
              Leaderboard
            </Link>
            <Link href="/profile" className="font-medium hover:text-primary">
              Profile
            </Link> */}
          </nav>
          <AuthToggle />
        </div>
      </header>

      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">
              Create Your Quiz
            </h1>

            {/* <Card className="mb-8">
              <CardHeader>
                <CardTitle>Select Category</CardTitle>
                <CardDescription>
                  Choose a category for your quiz questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span>{category.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Select Difficulty</CardTitle>
                <CardDescription>
                  Choose how challenging you want your quiz to be
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {difficulties.map((difficulty) => (
                    <Button
                      key={difficulty.id}
                      variant={
                        selectedDifficulty === difficulty.id
                          ? "default"
                          : "outline"
                      }
                      className="h-auto py-4 flex flex-col gap-2 justify-center items-center text-left"
                      onClick={() => setSelectedDifficulty(difficulty.id)}
                    >
                      <span className="font-bold">{difficulty.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Number of Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {questionCounts.map((count) => (
                      <Button
                        key={count}
                        variant={
                          selectedQuestionCount === count
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedQuestionCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Limit (seconds)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {timeLimits.map((time) => (
                      <Button
                        key={time}
                        variant={
                          selectedTimeLimit === time ? "default" : "outline"
                        }
                        onClick={() => setSelectedTimeLimit(time)}
                      >
                        {time === 0 ? "No Limit" : time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="gap-2"
                onClick={startQuiz}
                disabled={!selectedCategory}
              >
                Start Quiz
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
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
            &copy; {new Date().getFullYear()} CRYPTOBRAINZ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
