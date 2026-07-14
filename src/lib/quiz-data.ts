// Dummy quiz data + types for the frontend-only quiz flow.
// A backend can later replace `generateQuiz()` with a real API call
// while the components continue to consume the same shape.

export type Difficulty = "Easy" | "Medium" | "Hard";

export const SUBJECTS = [
  "Java",
  "Data Structures & Algorithms",
  "DBMS",
  "SQL",
  "Operating System",
  "Computer Networks",
  "Aptitude",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const QUESTION_COUNTS = [5, 10, 15] as const;

export interface Question {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

type BankEntry = Omit<Question, "id" | "subject" | "difficulty">;

const BANK: Record<Subject, BankEntry[]> = {
  Java: [
    { question: "Which keyword is used to inherit a class in Java?", options: ["this", "extends", "implements", "super"], correctIndex: 1, explanation: "`extends` is used for class inheritance; `implements` is for interfaces.", topic: "OOP" },
    { question: "What is the size of int in Java?", options: ["2 bytes", "4 bytes", "8 bytes", "Depends on JVM"], correctIndex: 1, explanation: "int is always 32-bit (4 bytes) in Java, regardless of platform.", topic: "Primitives" },
    { question: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], correctIndex: 2, explanation: "HashSet implements the Set contract, so duplicates are rejected.", topic: "Collections" },
    { question: "Which of these is NOT a Java access modifier?", options: ["private", "protected", "internal", "public"], correctIndex: 2, explanation: "Java has private, protected, public and package-private. `internal` is from C#/Kotlin.", topic: "OOP" },
  ],
  "Data Structures & Algorithms": [
    { question: "Time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctIndex: 1, explanation: "Binary search halves the range each step, so it runs in O(log n).", topic: "Searching" },
    { question: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Heap", "Deque"], correctIndex: 1, explanation: "A stack is Last-In-First-Out by definition.", topic: "Stacks" },
    { question: "Worst case complexity of QuickSort?", options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"], correctIndex: 2, explanation: "With a poor pivot choice QuickSort degrades to O(n^2).", topic: "Sorting" },
    { question: "Which traversal visits root, left, right?", options: ["Inorder", "Preorder", "Postorder", "Level order"], correctIndex: 1, explanation: "Preorder traversal is root -> left -> right.", topic: "Trees" },
  ],
  DBMS: [
    { question: "Which normal form removes transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 2, explanation: "3NF removes transitive dependencies between non-key attributes.", topic: "Normalization" },
    { question: "ACID stands for?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Identity, Data", "Atomic, Cached, Indexed, Durable", "Async, Consistent, Isolated, Distributed"], correctIndex: 0, explanation: "ACID = Atomicity, Consistency, Isolation, Durability.", topic: "Transactions" },
    { question: "A primary key can be:", options: ["NULL", "Duplicate", "Unique and NOT NULL", "Optional"], correctIndex: 2, explanation: "Primary keys must be unique and non-null.", topic: "Keys" },
  ],
  SQL: [
    { question: "Which clause filters rows AFTER grouping?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctIndex: 1, explanation: "HAVING filters aggregated groups; WHERE filters rows before grouping.", topic: "Aggregation" },
    { question: "Which JOIN returns only matching rows in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], correctIndex: 2, explanation: "INNER JOIN returns only rows with matches on both sides.", topic: "Joins" },
    { question: "Which command removes a table entirely?", options: ["DELETE", "DROP", "TRUNCATE", "REMOVE"], correctIndex: 1, explanation: "DROP TABLE removes the table structure and data.", topic: "DDL" },
  ],
  "Operating System": [
    { question: "Which scheduling algorithm is non-preemptive?", options: ["Round Robin", "SJF (non-preemptive)", "SRTF", "Priority (preemptive)"], correctIndex: 1, explanation: "Classic SJF picks the shortest job and runs it to completion.", topic: "Scheduling" },
    { question: "Deadlock requires which condition?", options: ["Preemption", "Circular wait", "Sharing", "Paging"], correctIndex: 1, explanation: "Circular wait is one of the four Coffman conditions for deadlock.", topic: "Concurrency" },
    { question: "Thrashing is caused by:", options: ["Too many page faults", "Fast CPU", "Large disk", "Low RAM usage"], correctIndex: 0, explanation: "Thrashing happens when the system spends more time paging than executing.", topic: "Memory" },
  ],
  "Computer Networks": [
    { question: "Which layer does TCP operate at?", options: ["Network", "Transport", "Session", "Application"], correctIndex: 1, explanation: "TCP is a Transport-layer protocol (Layer 4).", topic: "TCP/IP" },
    { question: "Default port for HTTPS?", options: ["80", "21", "443", "22"], correctIndex: 2, explanation: "HTTPS uses TCP port 443 by default.", topic: "Protocols" },
    { question: "Which device operates at Layer 2?", options: ["Router", "Switch", "Hub", "Gateway"], correctIndex: 1, explanation: "Switches use MAC addresses, which live at the Data Link layer (L2).", topic: "Devices" },
  ],
  Aptitude: [
    { question: "If 5 workers build a wall in 12 days, how long for 10 workers?", options: ["6 days", "12 days", "24 days", "3 days"], correctIndex: 0, explanation: "Work is inversely proportional to workers: 12 * 5 / 10 = 6.", topic: "Time & Work" },
    { question: "What comes next: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], correctIndex: 2, explanation: "Differences are 4,6,8,10,12 -> 30+12 = 42.", topic: "Number Series" },
    { question: "20% of 250 is?", options: ["25", "50", "40", "60"], correctIndex: 1, explanation: "20% of 250 = 250 * 0.2 = 50.", topic: "Percentages" },
  ],
};

export function generateQuiz(subject: Subject, difficulty: Difficulty, count: number): Question[] {
  const base = BANK[subject];
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const src = base[i % base.length];
    out.push({
      id: `${subject}-${difficulty}-${i}`,
      subject,
      difficulty,
      ...src,
      question: i < base.length ? src.question : `${src.question} (variant ${Math.floor(i / base.length) + 1})`,
    });
  }
  return out;
}
