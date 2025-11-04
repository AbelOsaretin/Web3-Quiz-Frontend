"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { generateQuestions } from "@/lib/quiz-generator";
import type { Question } from "@/lib/types";

export default function PlayQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const category = searchParams.get("category") || "general";
  const difficulty = searchParams.get("difficulty") || "medium";
  const count = Number.parseInt(searchParams.get("count") || "10", 10);
  const timeLimit = Number.parseInt(searchParams.get("time") || "60", 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const generatedQuestions = await generateQuestions(
          category,
          difficulty,
          count
        );

        // normalize incoming question shape to our expected fields
        const normalized = (generatedQuestions as any[]).map((g) => ({
          question: g.question ?? g.Question,
          options: g.options ?? g.Options,
          correctAnswer: g.correctAnswer ?? g.CorrectAnswer ?? "",
          questionId: g.questionId ?? g.QuestionId ?? null,
        }));

        setQuestions(normalized as Question[]);
        // prepare answers array to match questions length
        setAnswers(new Array(normalized.length).fill(null));
      } catch (error) {
        console.error("Failed to generate questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [category, difficulty, count]);

  // Timer effect
  useEffect(() => {
    if (loading || quizCompleted || !timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isAnswerSubmitted) {
            handleAnswerSubmit(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quizCompleted, timeLimit, isAnswerSubmitted]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.filter((a) => a !== null).length;

  const handleAnswerSelect = (answer: string, index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(answer);
    setSelectedIndex(index);
  };

  const submitQuiz = async (finalAnswers: Array<number | null>) => {
    setSubmitting(true);
    setSubmissionError(null);
    try {
      // derive user info from query params or localStorage (if present)
      const userId =
        (searchParams.get("userId") as string | null) ||
        (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
      const userWallet =
        (searchParams.get("userWallet") as string | null) ||
        (typeof window !== "undefined"
          ? localStorage.getItem("userWallet")
          : null);

      // generate a quizAttemptId
      const quizAttemptId =
        (globalThis as any).crypto && (globalThis as any).crypto.randomUUID
          ? (globalThis as any).crypto.randomUUID()
          : `qa-${Date.now()}`;

      // build answers payload expected by your webhook
      const answersPayload = finalAnswers.map((ans, idx) => ({
        questionId: (questions as any)[idx]?.questionId ?? idx + 1,
        userAnswerIndex: ans,
      }));

      const payload = {
        userId: userId ?? "",
        userWallet: userWallet ?? "",
        quizAttemptId,
        answers: answersPayload,
      };

      const res = await fetch(
        "https://abelosaretin.name.ng/webhook/submitQuiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`submission failed: ${res.status} ${text}`);
      }

      // parse backend response (try JSON, fall back to text)
      try {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          console.debug("submitQuiz response (json):", json);
          setSubmissionResult(json);
          if (json && typeof json.score === "number") {
            setScore(json.score);
          }
        } else {
          // non-json response: capture as text
          const text = await res.text();
          console.debug("submitQuiz response (text):", text);
          setSubmissionResult(text);
        }
      } catch (e) {
        console.warn("submitQuiz: failed to parse response", e);
        try {
          const text = await res.text();
          setSubmissionResult(text);
        } catch (ee) {
          setSubmissionResult(null);
        }
      }
    } catch (err: any) {
      console.error("Submit quiz error:", err);
      setSubmissionError(err?.message ?? String(err));
    } finally {
      setSubmitting(false);
      setQuizCompleted(true);
    }
  };

  const handleAnswerSubmit = (answerIndex: number | null) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    // compute next answers array synchronously to avoid race with state update
    const nextAnswers = [...answers];
    nextAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(nextAnswers);

    setIsAnswerSubmitted(true);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setSelectedIndex(null);
        setIsAnswerSubmitted(false);
        setTimeRemaining(timeLimit);
      } else {
        // all questions answered: submit answers to backend
        submitQuiz(nextAnswers);
      }
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
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
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Brain className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold mt-4">Generating Your Quiz...</h2>
            <p className="text-muted-foreground mt-2">
              Our AI is crafting challenging questions just for you
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage =
      typeof score === "number" && questions.length
        ? Math.round((score / questions.length) * 100)
        : null;

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
          </div>
        </header>

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {submissionResult && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Server response (debug)</h4>
                  <pre className="p-3 bg-muted/20 rounded text-sm overflow-auto">
                    {typeof submissionResult === "string"
                      ? submissionResult
                      : JSON.stringify(submissionResult, null, 2)}
                  </pre>
                </div>
              )}
              <Card className="overflow-hidden">
                <div
                  className="bg-primary h-2"
                  style={{ width: `${percentage ?? 0}%` }}
                ></div>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    {percentage === null ? (
                      <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center">
                        <Brain className="h-12 w-12 text-amber-500" />
                      </div>
                    ) : percentage >= 70 ? (
                      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center">
                        <Brain className="h-12 w-12 text-amber-500" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold">Your Score</h3>
                    <p className="text-5xl font-bold my-4">
                      {typeof score === "number" ? (
                        <>
                          {score} / {questions.length}
                          <span className="text-lg text-muted-foreground ml-2">
                            ({percentage}%)
                          </span>
                        </>
                      ) : (
                        <span className="text-lg text-muted-foreground">
                          Results pending...
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {percentage === null
                        ? "We'll send your answers to the server for grading."
                        : percentage >= 90
                        ? "Outstanding! You're a true expert!"
                        : percentage >= 70
                        ? "Great job! You know your stuff!"
                        : percentage >= 50
                        ? "Good effort! Keep learning!"
                        : "Keep practicing! You'll improve with time!"}
                    </p>
                  </div>

                  {submitting && (
                    <div className="text-center text-sm text-muted-foreground">
                      Submitting your answers...
                    </div>
                  )}
                  {submissionError && (
                    <div className="text-center text-sm text-destructive">
                      Submission error: {submissionError}
                    </div>
                  )}

                  {/* Show webhook response if present */}
                  {submissionResult && Array.isArray(submissionResult) && (
                    <div className="mt-4">
                      {/** backend returns an array with { data: [...] } objects **/}
                      {(submissionResult as any[]).map((block, i) => (
                        <div key={i} className="mb-4">
                          {block?.data && Array.isArray(block.data) && (
                            <div className="space-y-3">
                              {block.data.length > 0 &&
                              block.data[0].Reward_Amount ? (
                                <div className="p-4 border rounded">
                                  <h4 className="font-semibold mb-2">
                                    Reward Claim
                                  </h4>
                                  <div className="text-sm">
                                    <div>
                                      <strong>Quiz Attempt ID:</strong>{" "}
                                      {block.data[0].Quiz_Attempt_ID}
                                    </div>
                                    <div>
                                      <strong>Reward Amount (wei):</strong>{" "}
                                      {block.data[0].Reward_Amount}
                                    </div>
                                    <div>
                                      <strong>Raw Claim ID:</strong>{" "}
                                      {block.data[0].Raw_Claim_ID}
                                    </div>
                                    <div>
                                      <strong>Signature:</strong>{" "}
                                      <code className="break-all">
                                        {block.data[0].Signature}
                                      </code>
                                    </div>
                                    <div>
                                      <strong>Status:</strong>{" "}
                                      {block.data[0].Status}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 border rounded">
                                  <h4 className="font-semibold mb-2">
                                    Failed Questions
                                  </h4>
                                  <div className="text-sm space-y-2">
                                    <div>
                                      <strong>Total Passed:</strong>{" "}
                                      {block.data[0]?.Total_Passed ?? "-"}
                                    </div>
                                    <div>
                                      <strong>Total Failed:</strong>{" "}
                                      {block.data[0]?.Total_Failed ?? "-"}
                                    </div>
                                    <ul className="list-disc list-inside mt-2">
                                      {block.data.map((q: any, idx: number) => (
                                        <li key={idx}>
                                          <strong>ID:</strong>{" "}
                                          {q.Failed_Question_ID} —{" "}
                                          {q.Failed_Questions_Text}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-semibold mb-2">Quiz Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Category:</div>
                      <div className="font-medium capitalize">{category}</div>
                      <div>Difficulty:</div>
                      <div className="font-medium capitalize">{difficulty}</div>
                      <div>Questions:</div>
                      <div className="font-medium">{questions.length}</div>
                      <div>Time Limit:</div>
                      <div className="font-medium">
                        {timeLimit ? `${timeLimit} seconds` : "No limit"}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/quiz/new")}
                  >
                    New Quiz
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/")}
                  >
                    Back to Home
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Brain className="h-4 w-4" />
              <span className="capitalize">{category}</span>
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="capitalize">{difficulty}</span>
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-sm text-muted-foreground">Question</span>
                <h2 className="text-xl font-bold">
                  {currentQuestionIndex + 1} of {questions.length}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Answered:</span>
                <Badge>{answeredCount}</Badge>
              </div>
              {timeLimit > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`font-mono ${
                      timeRemaining < 10 ? "text-destructive animate-pulse" : ""
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>

            <Progress
              value={(currentQuestionIndex / questions.length) * 100}
              className="mb-8"
            />

            {currentQuestion && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedIndex === idx;

                      return (
                        <Button
                          key={option}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-4 px-6 justify-start text-left ${
                            isSelected ? "bg-primary text-white" : ""
                          }`}
                          onClick={() => handleAnswerSelect(option, idx)}
                          disabled={isAnswerSubmitted}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="flex-1">{option}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleAnswerSubmit(selectedIndex)}
                    disabled={selectedIndex === null || isAnswerSubmitted}
                  >
                    {isAnswerSubmitted ? "Next Question" : "Submit Answer"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
