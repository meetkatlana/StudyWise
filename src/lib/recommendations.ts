import type { QuizAttempt } from "./history-store";
import type { Subject } from "./quiz-data";

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  pct: number;
}

export function computeTopicStats(attempt: QuizAttempt): TopicStat[] {
  const map = new Map<string, { correct: number; total: number }>();
  attempt.questions.forEach((q, i) => {
    const cur = map.get(q.topic) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (attempt.answers[i] === q.correctIndex) cur.correct += 1;
    map.set(q.topic, cur);
  });
  return Array.from(map.entries()).map(([topic, s]) => ({
    topic,
    correct: s.correct,
    total: s.total,
    pct: Math.round((s.correct / s.total) * 100),
  }));
}

export function splitTopics(stats: TopicStat[]) {
  const weak = stats.filter((s) => s.pct < 60).map((s) => s.topic);
  const strong = stats.filter((s) => s.pct >= 60).map((s) => s.topic);
  return { weak, strong };
}

export function coachNote(accuracy: number): string {
  if (accuracy >= 90)
    return "Excellent work! You are placement-ready. Focus on advanced interview questions.";
  if (accuracy >= 70)
    return "Great progress. Revise weak topics and practice one mock test daily.";
  return "You should strengthen your fundamentals before attempting harder quizzes.";
}

export interface RoadmapDay {
  day: string;
  focus: string;
  minutes: number;
}

export function buildRoadmap(
  subject: Subject,
  weakTopics: string[],
): RoadmapDay[] {
  const primary = weakTopics[0] ?? `${subject} fundamentals`;
  const secondary = weakTopics[1] ?? "Core concepts";
  const tertiary = weakTopics[2] ?? subject;
  return [
    { day: "Day 1", focus: `${primary} basics`, minutes: 45 },
    { day: "Day 2", focus: `${primary} deep dive`, minutes: 60 },
    { day: "Day 3", focus: `${secondary} practice`, minutes: 45 },
    { day: "Day 4", focus: `${tertiary} — targeted practice questions`, minutes: 45 },
    { day: "Day 5", focus: `${subject} medium MCQs`, minutes: 45 },
    { day: "Day 6", focus: `${subject} mock test`, minutes: 60 },
    { day: "Day 7", focus: `${subject} revision & reflection`, minutes: 30 },
  ];
}

/** Sub-drills for common weak topics; falls back to generic drills. */
const PRACTICE_MAP: Record<string, string[]> = {
  // Java
  OOP: ["Inheritance", "Polymorphism", "Abstraction", "Interfaces"],
  Collections: ["HashMap basics", "ArrayList vs LinkedList", "TreeSet ordering"],
  Primitives: ["int/long ranges", "Autoboxing pitfalls", "Type casting"],
  // DSA
  Searching: ["Binary search", "Search in rotated array", "First/last occurrence"],
  Sorting: ["QuickSort", "MergeSort", "HeapSort"],
  Stacks: ["Balanced brackets", "Next greater element", "Min-stack"],
  Trees: ["BFS traversal", "DFS traversal", "Lowest common ancestor"],
  // DBMS
  Normalization: ["1NF → 2NF", "3NF vs BCNF", "Functional dependencies"],
  Transactions: ["ACID properties", "Isolation levels", "Deadlocks in DB"],
  Keys: ["Primary key", "Foreign key", "Composite key"],
  // SQL
  Joins: ["INNER JOIN", "LEFT JOIN", "Self join", "Nested queries"],
  Aggregation: ["GROUP BY", "HAVING clause", "Window functions"],
  DDL: ["CREATE / ALTER", "DROP vs TRUNCATE", "Constraints"],
  // OS
  Scheduling: ["FCFS vs SJF", "Round Robin", "Priority scheduling"],
  Concurrency: ["Deadlock conditions", "Semaphores", "Mutex vs monitor"],
  Memory: ["Paging", "Segmentation", "Thrashing"],
  // Networks
  "TCP/IP": ["TCP handshake", "UDP vs TCP", "Congestion control"],
  Protocols: ["HTTP vs HTTPS", "DNS lookup", "SMTP/FTP basics"],
  Devices: ["Switch vs router", "Hub vs switch", "Layer mapping"],
  // Aptitude
  "Time & Work": ["Man-days", "Pipes & cisterns", "Efficiency ratios"],
  "Number Series": ["Arithmetic series", "Geometric series", "Mixed patterns"],
  Percentages: ["Successive %", "Profit & loss %", "Discount chains"],
};

export function practiceItems(weakTopics: string[]): {
  topic: string;
  drills: string[];
}[] {
  const source = weakTopics.length ? weakTopics : ["Mixed practice"];
  return source.slice(0, 4).map((t) => ({
    topic: t,
    drills:
      PRACTICE_MAP[t] ??
      [`${t} basics`, `${t} MCQs`, `${t} interview questions`],
  }));
}

const VIDEO_QUERIES: Record<Subject, string> = {
  Java: "java+placement+interview",
  "Data Structures & Algorithms": "dsa+placement+interview",
  DBMS: "dbms+placement",
  SQL: "sql+placement",
  "Operating System": "operating+system+placement",
  "Computer Networks": "computer+networks+placement",
  Aptitude: "aptitude+placement",
};

export interface VideoLink {
  title: string;
  subtitle: string;
  url: string;
}

export function recommendedVideos(
  subject: Subject,
  weakTopics: string[],
): VideoLink[] {
  const base = VIDEO_QUERIES[subject];
  const subjectUrl = `https://www.youtube.com/results?search_query=${base}`;
  const links: VideoLink[] = [
    {
      title: `${subject} — placement interview playlist`,
      subtitle: "Curated YouTube results",
      url: subjectUrl,
    },
  ];
  const focus = weakTopics.slice(0, 2);
  for (const t of focus) {
    const q = encodeURIComponent(`${t} ${subject} tutorial`);
    links.push({
      title: `${t} — focused tutorial`,
      subtitle: `Search: ${t} ${subject}`,
      url: `https://www.youtube.com/results?search_query=${q}`,
    });
  }
  if (links.length < 3) {
    links.push({
      title: `${subject} — top interview MCQs`,
      subtitle: "Curated YouTube results",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${subject} interview mcq`,
      )}`,
    });
  }
  return links.slice(0, 3);
}
