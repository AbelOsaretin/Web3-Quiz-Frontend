"use client";

import { useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Atom, // for Blockchain Basics
  Globe, // for Web3 Basics
  Bitcoin, // for Cryptocurrency Basics
  Image, // for NFT
  TrendingUp, // for DeFi
  Code, // for Smart Contract
  Shield, // for Cryptography
  PieChart,
  Brain,
} from "lucide-react";
import AuthToggle from "@/components/AuthToggle";

const categories = [
  {
    id: "Blockchain_Basics",
    name: "Blockchain Basics",
    description:
      "Understand the foundational concepts and technology behind blockchains",
    icon: Atom,
    color: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-500",
    questionCount: 500,
  },
  {
    id: "Web3_Basics",
    name: "Web3 Basics",
    description:
      "Explore the principles and components of the decentralized web",
    icon: Globe,
    color: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-500",
    questionCount: 450,
  },
  {
    id: "Cryptocurrency_Basics",
    name: "Cryptocurrency Basics",
    description:
      "Learn about digital currencies, wallets, transactions, and more",
    icon: Bitcoin,
    color: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-500",
    questionCount: 600,
  },
  {
    id: "NFTs",
    name: "NFT",
    description:
      "Dive into non-fungible tokens, their use cases, and standards",
    icon: Image,
    color: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-500",
    questionCount: 400,
  },
  {
    id: "DeFi",
    name: "DeFi",
    description: "Discover decentralized finance protocols, tools, and risks",
    icon: TrendingUp,
    color: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-500",
    questionCount: 550,
  },
  {
    id: "Smart_Contract",
    name: "Smart Contract",
    description:
      "Master the programming and execution of self-executing contracts",
    icon: Code,
    color: "bg-pink-100 dark:bg-pink-900",
    iconColor: "text-pink-500",
    questionCount: 350,
  },
  {
    id: "Cryptography",
    name: "Cryptography",
    description:
      "Understand the security principles and cryptographic techniques behind blockchain",
    icon: Shield,
    color: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-500",
    questionCount: 480,
  },
  {
    id: "Tokenomics",
    name: "Tokenomics",
    description:
      "Explore the economics, distribution, and governance of tokens",
    icon: PieChart,
    color: "bg-teal-100 dark:bg-teal-900",
    iconColor: "text-teal-500",
    questionCount: 700,
  },
];

export default function CategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user && mounted) {
          router.push("/login");
        }
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
            <Link href="/categories" className="font-medium text-primary">
              Categories
            </Link>
            {/* <Link href="/leaderboard" className="font-medium hover:text-primary">
              Leaderboard
            </Link>*/}
            <Link href="/profile" className="font-medium hover:text-primary">
              Profile
            </Link>
          </nav>
          <AuthToggle />
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Quiz Categories</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of categories to test your knowledge and
              challenge yourself with AI-generated questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className={`${category.color}`}>
                  <div className="flex justify-between items-start">
                    <category.icon
                      className={`h-8 w-8 ${category.iconColor}`}
                    />
                    <Badge variant="secondary">
                      {category.questionCount}+ Questions
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{category.name}</CardTitle>
                  <CardDescription className="text-foreground/70">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Easy</Badge>
                    <Badge variant="outline">Medium</Badge>
                    <Badge variant="outline">Hard</Badge>
                  </div> */}
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/quiz/new?category=${category.id}`}
                    className="w-full"
                  >
                    <Button className="w-full">Start Quiz</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
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
