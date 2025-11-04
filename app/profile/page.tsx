"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, User, Trophy } from "lucide-react";

import { useAppKitAccount } from "@reown/appkit/react";

import { formatUnits } from "viem";

import { useWriteContract } from "wagmi";
import { abi } from "@/lib/abi";

// Using shared Supabase client from lib/supabaseClient.ts

// Notes / assumptions:
// - Tables are named: `users`, `user_rewards`, `user_quiz_history`.
// - Each table has a column that identifies the user. For `users` it's `id`.
// - For rewards and quiz history the column is `User_ID` (matching the mock data keys).
// If your table names / columns differ, update the queries below accordingly.

export default function ProfilePage() {
  const { writeContract } = useWriteContract();
  const { isConnected } = useAppKitAccount();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("history");
  const [userIdInput, setUserIdInput] = useState("U001");
  const [userData, setUserData] = useState<any>({ data: [] });
  const [userRewards, setUserRewards] = useState<any>({ data: [] });
  const [userQuizHistory, setUserQuizHistory] = useState<any>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch three tables filtered by a user ID
  async function fetchForUser(userId: string) {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      // users
      const { data: uData, error: uErr } = await supabase
        .from("Web3_Quiz_User_Data")
        .select("*")
        .eq("User_ID", userId)
        .maybeSingle();
      if (uErr) {
        console.error("users fetch error:", uErr);
        setError("Failed to fetch user data");
      } else if (uData) {
        setUserData({ data: uData });
      } else {
        setUserData({ data: uData ?? [] });
      }

      // user_rewards
      const { data: rewards, error: rErr } = await supabase
        .from("Web3_Quiz_User_Reward")
        .select("*")
        .eq("User_ID", userId);
      if (rErr) {
        console.error("rewards fetch error:", rErr);
        setError((prev) => prev ?? "Failed to fetch rewards");
      } else {
        setUserRewards({ data: rewards ?? [] });
      }

      // user_quiz_history
      const { data: history, error: hErr } = await supabase
        .from("Web3_Quiz_User_Result")
        .select("*")
        .eq("User_ID", userId);
      if (hErr) {
        console.error("history fetch error:", hErr);
        setError((prev) => prev ?? "Failed to fetch quiz history");
      } else {
        setUserQuizHistory({ data: history ?? [] });
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  // On mount: if the user is signed in with Supabase (including OAuth), ensure
  // there's a corresponding row in Web3_Quiz_User_Data and load their data.
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // try to get Supabase user session first
      try {
        const {
          data: { user },
          error: uErr,
        }: any = await supabase.auth.getUser();

        if (uErr) console.warn("auth.getUser error:", uErr);

        if (user && mounted) {
          const uid = user.id as string;
          setUserIdInput(uid);
          // persist for legacy parts of app that read localStorage
          if (typeof window !== "undefined")
            localStorage.setItem("userId", uid);

          // ensure a row exists in Web3_Quiz_User_Data
          try {
            const { data: existing, error: checkErr } = await supabase
              .from("Web3_Quiz_User_Data")
              .select("id")
              .eq("User_ID", uid)
              .maybeSingle();
            if (checkErr) {
              console.warn("check user data error:", checkErr);
            }
            if (!existing) {
              // insert a new record with available metadata
              const displayName =
                (user.user_metadata &&
                  (user.user_metadata.name || user.user_metadata.full_name)) ||
                user.email ||
                "";
              const { error: insertErr } = await supabase
                .from("Web3_Quiz_User_Data")
                .insert([
                  {
                    User_ID: uid,
                    Name: displayName,
                    Email: user.email ?? null,
                  },
                ]);
              if (insertErr) console.warn("insert user data error:", insertErr);
            }
          } catch (e) {
            console.error("ensure user record error:", e);
          }

          // finally load user-specific data
          fetchForUser(uid);
          return;
        }
        // if there's no authenticated user, redirect to login
        if (mounted) {
          // check localStorage fallback first
          const stored =
            typeof window !== "undefined"
              ? localStorage.getItem("userId")
              : null;
          if (!stored) {
            router.push("/login");
            return;
          }
        }
      } catch (err) {
        console.error("getUser error:", err);
      }

      // fallback: use localStorage if no authenticated session
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("userId");
      if (stored) {
        setUserIdInput(stored);
        fetchForUser(stored);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <div className="flex items-center justify-between md:justify-start">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <div className="flex items-center gap-2">
                    <Brain className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">CRYPTO BRAINZ</h1>
                  </div>
                </Link>
              </div>
              <div className="md:hidden">
                <div className="flex gap-2">
                  <appkit-button />
                  <Button variant="outline">Logout</Button>
                </div>
              </div>
            </div>

            <nav className="flex justify-center gap-4 mt-3 md:mt-0">
              <Link
                href="/"
                className="font-medium hover:text-primary text-sm md:text-base"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="font-medium hover:text-primary text-sm md:text-base"
              >
                Categories
              </Link>
              <Link
                href="/profile"
                className="font-medium text-primary text-sm md:text-base"
              >
                Profile
              </Link>
            </nav>

            <div className="hidden md:flex justify-end gap-2 items-center">
              <appkit-button />
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch (e) {
                    console.error("Sign out error:", e);
                  }
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("userId");
                  }
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
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
                <h1 className="text-3xl font-bold">{userData.data.Name}</h1>
                <p className="text-muted-foreground">{userData.data.Email}</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* <input
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="User ID (e.g. U001)"
                />
                <Button onClick={() => fetchForUser(userIdInput)}>
                  {loading ? "Loading..." : "Load"}
                </Button> */}
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
                    {userQuizHistory.data.map((quiz: any) => (
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
                  {/* <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {userRewards.data
                        ?.filter((reward: any) => reward.Status === "Unclaimed") // 👈 Only show unclaimed rewards
                        .map((reward: any) => (
                          <div
                            key={reward.id}
                            className="bg-muted/50 rounded-lg p-4 text-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">
                              ${`${formatUnits(reward.Reward_Amount, 6)}.00`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned on{" "}
                              {new Date(reward.created_at).toLocaleDateString()}
                            </p>
                            <br />
                            <Button
                              onClick={() => {
                                if (!isConnected) {
                                  alert(
                                    "Please connect your wallet to claim rewards."
                                  );
                                  return;
                                }
                                writeContract({
                                  abi,
                                  address:
                                    "0x65f19aA25AeAb8cd8346E1b8CCCc880a26730E52",
                                  functionName: "claimReward",
                                  args: [
                                    reward.User_ID,
                                    reward.User_Wallet_Address,
                                    reward.Reward_Amount,
                                    reward.Raw_Claim_ID,
                                    reward.Signature,
                                  ],
                                });

                                console.log("Reward Claiming Initiated...");
                              }}
                            >
                              Get Reward
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent> */}

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const firstReward = userRewards.data?.filter(
                          (reward: any) => reward.Status === "Unclaimed"
                        )[0];

                        if (!firstReward) {
                          return <p>No rewards available.</p>;
                        }

                        return (
                          <div
                            key={firstReward.id}
                            className="bg-muted/50 rounded-lg p-4 text-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">
                              $
                              {`${formatUnits(
                                firstReward.Reward_Amount,
                                6
                              )}.00`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned on{" "}
                              {new Date(
                                firstReward.created_at
                              ).toLocaleDateString()}
                            </p>
                            <br />
                            <Button
                              onClick={() => {
                                if (!isConnected) {
                                  alert(
                                    "Please connect your wallet to claim rewards."
                                  );
                                  return;
                                }
                                // writeContract({
                                //   abi,
                                //   address:
                                //     "0x65f19aA25AeAb8cd8346E1b8CCCc880a26730E52",
                                //   functionName: "claimReward",
                                //   args: [
                                //     firstReward.User_ID,
                                //     firstReward.User_Wallet_Address,
                                //     firstReward.Reward_Amount,
                                //     firstReward.Raw_Claim_ID,
                                //     firstReward.Signature,
                                //   ],
                                // });

                                console.log("Reward Claiming Initiated...");
                              }}
                              disabled
                            >
                              Get Reward
                            </Button>
                          </div>
                        );
                      })()}
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
                        ?.filter((reward: any) => reward.Status === "Claimed") // 👈 Only show unclaimed rewards
                        .map((reward: any) => (
                          <div
                            key={reward.id}
                            className="bg-muted/50 rounded-lg p-4 text-center opacity-60"
                          >
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">
                              {`${formatUnits(reward.Reward_Amount, 6)}.00`}
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
