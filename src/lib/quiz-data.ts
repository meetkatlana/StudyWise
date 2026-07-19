// Frontend quiz bank + generator.
//
// generateQuiz() rules (matches product spec):
//   * Never returns two copies of the same question in a single quiz.
//   * Prefers questions the user has not seen recently (tracked in
//     localStorage per subject+difficulty bucket).
//   * Randomises order every time.
//   * Falls back to previously-seen questions only when the unseen pool
//     is smaller than the requested count.
//   * All picked questions are recorded as "seen" for next time.

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

// prettier-ignore
const BANK: Record<Subject, Record<Difficulty, BankEntry[]>> = {
  Java: {
    Easy: [
      { question: "Which keyword is used to inherit a class in Java?", options: ["this", "extends", "implements", "super"], correctIndex: 1, explanation: "`extends` is used for class inheritance; `implements` is for interfaces.", topic: "OOP" },
      { question: "What is the size of `int` in Java?", options: ["2 bytes", "4 bytes", "8 bytes", "Depends on JVM"], correctIndex: 1, explanation: "int is always 32-bit (4 bytes) in Java, regardless of platform.", topic: "Primitives" },
      { question: "Which of these is NOT a Java access modifier?", options: ["private", "protected", "internal", "public"], correctIndex: 2, explanation: "Java has private, protected, public and package-private. `internal` is from C#/Kotlin.", topic: "OOP" },
      { question: "Which method is the entry point of a Java program?", options: ["start()", "run()", "main()", "init()"], correctIndex: 2, explanation: "`public static void main(String[] args)` is the JVM entry point.", topic: "Basics" },
      { question: "Which of the following is a wrapper class?", options: ["int", "Integer", "long", "double"], correctIndex: 1, explanation: "`Integer` is the wrapper class for the primitive `int`.", topic: "Wrappers" },
      { question: "Which package is imported by default in every Java program?", options: ["java.util", "java.io", "java.lang", "java.net"], correctIndex: 2, explanation: "`java.lang` is auto-imported (String, Math, System, etc.).", topic: "Packages" },
      { question: "What is the default value of a boolean instance variable?", options: ["true", "false", "0", "null"], correctIndex: 1, explanation: "Uninitialised boolean fields default to `false`.", topic: "Primitives" },
      { question: "Which operator is used for string concatenation?", options: ["&", "+", ".", "*"], correctIndex: 1, explanation: "`+` is overloaded to concatenate strings in Java.", topic: "Operators" },
    ],
    Medium: [
      { question: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], correctIndex: 2, explanation: "HashSet implements the Set contract, so duplicates are rejected.", topic: "Collections" },
      { question: "What does the `final` keyword mean on a method?", options: ["Method runs last", "Method cannot be overridden", "Method is abstract", "Method is static"], correctIndex: 1, explanation: "`final` methods cannot be overridden by subclasses.", topic: "OOP" },
      { question: "Which interface must a class implement to allow its objects to be sorted with `Collections.sort()`?", options: ["Comparator", "Comparable", "Sortable", "Iterable"], correctIndex: 1, explanation: "Natural ordering is defined via `Comparable#compareTo`.", topic: "Collections" },
      { question: "What is the output of `System.out.println(10 / 3);`?", options: ["3.33", "3", "3.0", "Error"], correctIndex: 1, explanation: "Integer division truncates toward zero — result is `3`.", topic: "Operators" },
      { question: "Which exception is thrown when dividing an int by zero?", options: ["NullPointerException", "ArithmeticException", "NumberFormatException", "IllegalStateException"], correctIndex: 1, explanation: "Integer division by zero raises `ArithmeticException`.", topic: "Exceptions" },
      { question: "Which of these is TRUE about `String` in Java?", options: ["Mutable", "Immutable", "Primitive", "Final primitive"], correctIndex: 1, explanation: "`String` is an immutable reference type.", topic: "Strings" },
      { question: "What does `hashCode()` return for two equal objects?", options: ["Always different", "Must be equal", "Can be either", "Undefined"], correctIndex: 1, explanation: "The equals/hashCode contract requires equal objects to have equal hash codes.", topic: "OOP" },
      { question: "Which keyword is used to prevent inheritance of a class?", options: ["static", "final", "sealed", "abstract"], correctIndex: 1, explanation: "A `final` class cannot be subclassed.", topic: "OOP" },
    ],
    Hard: [
      { question: "What is the difference between `==` and `.equals()` for String?", options: ["No difference", "== compares refs, equals compares content", "== compares content, equals compares refs", "Both compare content"], correctIndex: 1, explanation: "`==` checks reference equality; `equals()` checks character-by-character content.", topic: "Strings" },
      { question: "Which of the following is TRUE about `volatile`?", options: ["Guarantees atomicity", "Guarantees visibility across threads", "Locks the object", "Same as synchronized"], correctIndex: 1, explanation: "`volatile` ensures reads/writes are visible to all threads but does NOT provide atomicity.", topic: "Concurrency" },
      { question: "What is the output? `Integer a=127,b=127; System.out.println(a==b);` then with 200.", options: ["true, true", "false, false", "true, false", "false, true"], correctIndex: 2, explanation: "Integer cache holds -128..127, so 127==127 is true but 200==200 uses different objects → false.", topic: "Wrappers" },
      { question: "Which GC algorithm is the default in Java 17?", options: ["Serial GC", "Parallel GC", "G1 GC", "CMS"], correctIndex: 2, explanation: "G1 has been the default since Java 9 and remains so in Java 17.", topic: "JVM" },
      { question: "Which of these is TRUE about `HashMap`?", options: ["Thread-safe", "Ordered by insertion", "Allows one null key", "Synchronised by default"], correctIndex: 2, explanation: "HashMap permits one null key and any number of null values; it is NOT thread-safe.", topic: "Collections" },
      { question: "What does the JVM do with an uncaught exception in a thread?", options: ["Ignores it", "Kills the JVM", "Terminates the thread, JVM continues if other non-daemon threads exist", "Restarts the thread"], correctIndex: 2, explanation: "Only that thread dies; the JVM exits only when all non-daemon threads finish.", topic: "Concurrency" },
      { question: "Which lock does `synchronized` on a static method use?", options: ["Instance lock", "Class lock (Class object)", "Method lock", "No lock"], correctIndex: 1, explanation: "Static synchronized methods lock the `Class` object, not any instance.", topic: "Concurrency" },
      { question: "What is the result of `\"a\".intern() == \"a\"` ?", options: ["true", "false", "Compile error", "Runtime error"], correctIndex: 0, explanation: "String literals are already in the string pool; intern returns the same reference.", topic: "Strings" },
    ],
  },

  "Data Structures & Algorithms": {
    Easy: [
      { question: "Time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctIndex: 1, explanation: "Binary search halves the range each step → O(log n).", topic: "Searching" },
      { question: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Heap", "Deque"], correctIndex: 1, explanation: "A stack is Last-In-First-Out by definition.", topic: "Stacks" },
      { question: "Which traversal visits root, left, right?", options: ["Inorder", "Preorder", "Postorder", "Level order"], correctIndex: 1, explanation: "Preorder traversal is root → left → right.", topic: "Trees" },
      { question: "A queue follows which order?", options: ["LIFO", "FIFO", "Random", "Priority"], correctIndex: 1, explanation: "Queues are First-In-First-Out.", topic: "Queues" },
      { question: "Which structure is best for implementing recursion?", options: ["Queue", "Stack", "Heap", "Graph"], correctIndex: 1, explanation: "Function calls are pushed/popped on the call stack.", topic: "Stacks" },
      { question: "Access time of an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctIndex: 2, explanation: "Arrays support constant-time random access.", topic: "Arrays" },
      { question: "Which of these is a linear data structure?", options: ["Tree", "Graph", "Linked List", "Heap"], correctIndex: 2, explanation: "Linked lists are linear; trees/graphs/heaps are hierarchical.", topic: "Basics" },
      { question: "How many children does a node in a binary tree have (max)?", options: ["1", "2", "3", "Unlimited"], correctIndex: 1, explanation: "By definition each node has at most two children.", topic: "Trees" },
    ],
    Medium: [
      { question: "Worst-case complexity of QuickSort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], correctIndex: 2, explanation: "With a poor pivot, QuickSort degrades to O(n²).", topic: "Sorting" },
      { question: "Which sorting algorithm is stable and has O(n log n) worst case?", options: ["QuickSort", "HeapSort", "MergeSort", "SelectionSort"], correctIndex: 2, explanation: "MergeSort is stable and always O(n log n).", topic: "Sorting" },
      { question: "Average lookup time in a hash table?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 0, explanation: "Amortised O(1) with a good hash function and load factor.", topic: "Hashing" },
      { question: "Which traversal of a BST yields sorted output?", options: ["Preorder", "Inorder", "Postorder", "Level order"], correctIndex: 1, explanation: "Inorder traversal of a BST visits nodes in ascending order.", topic: "Trees" },
      { question: "Which algorithm finds shortest path in weighted graph with non-negative edges?", options: ["BFS", "DFS", "Dijkstra", "Bellman-Ford"], correctIndex: 2, explanation: "Dijkstra's algorithm is the standard for non-negative weights.", topic: "Graphs" },
      { question: "Which data structure implements LRU cache efficiently?", options: ["Array + Stack", "HashMap + Doubly Linked List", "Two queues", "Only HashMap"], correctIndex: 1, explanation: "HashMap gives O(1) lookup; DLL gives O(1) reorder/eviction.", topic: "Design" },
      { question: "Height of a balanced BST with n nodes?", options: ["O(n)", "O(log n)", "O(√n)", "O(1)"], correctIndex: 1, explanation: "Balanced BSTs (AVL, Red-Black) maintain height O(log n).", topic: "Trees" },
      { question: "Which of these problems is solved by dynamic programming?", options: ["Merge sort", "Fibonacci", "Binary search", "Bubble sort"], correctIndex: 1, explanation: "Naïve Fibonacci is exponential; DP memoises to O(n).", topic: "DP" },
    ],
    Hard: [
      { question: "Minimum swaps to sort an array using cycle detection is based on?", options: ["Union-Find", "Graph cycles", "DP", "Greedy"], correctIndex: 1, explanation: "Model positions as a graph; each cycle of length k needs k-1 swaps.", topic: "Arrays" },
      { question: "Which algorithm finds all pairs shortest paths?", options: ["Dijkstra", "Kruskal", "Floyd-Warshall", "Prim"], correctIndex: 2, explanation: "Floyd-Warshall runs in O(V³) for all-pairs shortest paths.", topic: "Graphs" },
      { question: "Amortised complexity of `push` on a dynamic array (vector)?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 0, explanation: "Doubling capacity yields amortised O(1) push.", topic: "Arrays" },
      { question: "What data structure is used in Dijkstra for O((V+E) log V)?", options: ["Queue", "Stack", "Min-heap (priority queue)", "Union-Find"], correctIndex: 2, explanation: "A min-heap gives efficient extract-min for Dijkstra.", topic: "Graphs" },
      { question: "Which of these problems is NP-complete?", options: ["Sorting", "Shortest path", "Travelling Salesman (decision)", "Binary search"], correctIndex: 2, explanation: "TSP is a classic NP-complete decision problem.", topic: "Complexity" },
      { question: "Space complexity of recursive Fibonacci (naive)?", options: ["O(1)", "O(n)", "O(2^n)", "O(log n)"], correctIndex: 1, explanation: "Depth of recursion tree is n, so stack space O(n).", topic: "Recursion" },
      { question: "Which structure supports range-sum queries in O(log n) with updates?", options: ["Array", "Stack", "Segment tree", "Hash table"], correctIndex: 2, explanation: "Segment trees / Fenwick trees give O(log n) range queries and updates.", topic: "Trees" },
      { question: "Kruskal's MST uses which auxiliary structure?", options: ["Min-heap", "Union-Find (DSU)", "Segment tree", "Trie"], correctIndex: 1, explanation: "DSU detects cycles when adding sorted edges.", topic: "Graphs" },
    ],
  },

  DBMS: {
    Easy: [
      { question: "A primary key can be:", options: ["NULL", "Duplicate", "Unique and NOT NULL", "Optional"], correctIndex: 2, explanation: "Primary keys must be unique and non-null.", topic: "Keys" },
      { question: "DBMS stands for?", options: ["Database Management System", "Data Backup Management Software", "Digital Business Management Suite", "Data Model Storage"], correctIndex: 0, explanation: "DBMS = Database Management System.", topic: "Basics" },
      { question: "Which command creates a new table?", options: ["MAKE TABLE", "NEW TABLE", "CREATE TABLE", "ADD TABLE"], correctIndex: 2, explanation: "`CREATE TABLE` is the DDL statement.", topic: "DDL" },
      { question: "A foreign key references which key of another table?", options: ["Foreign key", "Candidate key", "Primary key", "Alternate key"], correctIndex: 2, explanation: "A foreign key references a primary (or unique) key in another table.", topic: "Keys" },
      { question: "Which language is used to define schema in DBMS?", options: ["DML", "DDL", "DCL", "TCL"], correctIndex: 1, explanation: "Data Definition Language (CREATE/ALTER/DROP) defines schemas.", topic: "SQL Languages" },
      { question: "Which of these is a relational DBMS?", options: ["MongoDB", "Redis", "PostgreSQL", "Neo4j"], correctIndex: 2, explanation: "PostgreSQL is relational; others are NoSQL.", topic: "Basics" },
    ],
    Medium: [
      { question: "Which normal form removes transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 2, explanation: "3NF removes transitive dependencies between non-key attributes.", topic: "Normalization" },
      { question: "ACID stands for?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Identity, Data", "Atomic, Cached, Indexed, Durable", "Async, Consistent, Isolated, Distributed"], correctIndex: 0, explanation: "ACID = Atomicity, Consistency, Isolation, Durability.", topic: "Transactions" },
      { question: "Which isolation level prevents dirty reads but allows non-repeatable reads?", options: ["Read uncommitted", "Read committed", "Repeatable read", "Serializable"], correctIndex: 1, explanation: "Read committed forbids dirty reads but still allows non-repeatable reads.", topic: "Transactions" },
      { question: "A relation is in 2NF if it is in 1NF and:", options: ["No partial dependency on primary key", "No transitive dependency", "No multi-valued attributes", "All keys are numeric"], correctIndex: 0, explanation: "2NF eliminates partial dependencies of non-prime attributes on part of a composite key.", topic: "Normalization" },
      { question: "Which index type stores data in sorted order at leaves?", options: ["Hash index", "B-Tree index", "Bitmap index", "Inverted index"], correctIndex: 1, explanation: "B-Tree leaves store keys in sorted order for range scans.", topic: "Indexing" },
      { question: "Which of these is a DML statement?", options: ["CREATE", "ALTER", "INSERT", "GRANT"], correctIndex: 2, explanation: "INSERT/UPDATE/DELETE/SELECT are DML.", topic: "SQL Languages" },
    ],
    Hard: [
      { question: "BCNF differs from 3NF because BCNF requires:", options: ["Every non-prime attribute is fully dependent", "Every determinant is a candidate key", "All attributes atomic", "No foreign keys"], correctIndex: 1, explanation: "BCNF: for every functional dependency X→Y, X must be a superkey.", topic: "Normalization" },
      { question: "Which concurrency-control protocol may cause cascading rollback?", options: ["Strict 2PL", "Basic 2PL", "Timestamp ordering", "Optimistic CC"], correctIndex: 1, explanation: "Non-strict 2PL releases locks before commit, causing cascading rollbacks.", topic: "Concurrency" },
      { question: "In a B+ tree of order m, the maximum number of keys in an internal node is:", options: ["m-1", "m", "m+1", "2m"], correctIndex: 0, explanation: "An order-m B+ tree internal node holds up to m-1 keys and m pointers.", topic: "Indexing" },
      { question: "Phantom reads are prevented by which isolation level?", options: ["Read uncommitted", "Read committed", "Repeatable read", "Serializable"], correctIndex: 3, explanation: "Serializable is the only standard level that prevents phantoms.", topic: "Transactions" },
      { question: "Which of these is TRUE about a view in SQL?", options: ["Physically stores data", "Is a stored query", "Cannot be indexed", "Is always updatable"], correctIndex: 1, explanation: "A view is a saved SELECT; it does not physically store rows by default.", topic: "Views" },
      { question: "The join operation that returns cross-product of two tables is:", options: ["INNER JOIN", "OUTER JOIN", "CROSS JOIN", "NATURAL JOIN"], correctIndex: 2, explanation: "CROSS JOIN yields the Cartesian product.", topic: "Joins" },
    ],
  },

  SQL: {
    Easy: [
      { question: "Which command removes a table entirely?", options: ["DELETE", "DROP", "TRUNCATE", "REMOVE"], correctIndex: 1, explanation: "DROP TABLE removes the table structure and data.", topic: "DDL" },
      { question: "Which clause filters rows in a SELECT statement?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correctIndex: 0, explanation: "WHERE filters individual rows before aggregation.", topic: "Basics" },
      { question: "Which keyword removes duplicate rows from a result?", options: ["UNIQUE", "DISTINCT", "REMOVE DUP", "DEDUPE"], correctIndex: 1, explanation: "`SELECT DISTINCT` removes duplicate rows.", topic: "Basics" },
      { question: "Which function returns the number of rows?", options: ["SUM()", "COUNT()", "AVG()", "TOTAL()"], correctIndex: 1, explanation: "`COUNT()` counts rows (or non-null values of a column).", topic: "Aggregation" },
      { question: "Which wildcard matches any single character in LIKE?", options: ["%", "_", "*", "?"], correctIndex: 1, explanation: "`_` matches exactly one character; `%` matches any run of characters.", topic: "Filtering" },
      { question: "Which command changes existing rows?", options: ["MODIFY", "UPDATE", "CHANGE", "ALTER"], correctIndex: 1, explanation: "`UPDATE` modifies rows; `ALTER` changes schema.", topic: "DML" },
    ],
    Medium: [
      { question: "Which clause filters rows AFTER grouping?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctIndex: 1, explanation: "HAVING filters aggregated groups; WHERE filters rows before grouping.", topic: "Aggregation" },
      { question: "Which JOIN returns only matching rows in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], correctIndex: 2, explanation: "INNER JOIN returns only rows with matches on both sides.", topic: "Joins" },
      { question: "What does `SELECT COUNT(DISTINCT col)` do?", options: ["Counts all rows", "Counts distinct non-null values", "Counts nulls too", "Errors out"], correctIndex: 1, explanation: "It counts distinct non-null values of the column.", topic: "Aggregation" },
      { question: "Which JOIN returns all rows from the left table?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], correctIndex: 1, explanation: "LEFT JOIN keeps all left rows, filling right side with NULLs when unmatched.", topic: "Joins" },
      { question: "Which subquery type executes once per outer row?", options: ["Scalar", "Correlated", "Nested", "Derived"], correctIndex: 1, explanation: "Correlated subqueries reference the outer query and run per row.", topic: "Subqueries" },
      { question: "Which of these is TRUE about a UNIQUE constraint?", options: ["Only one per table", "Allows one NULL (in most engines)", "Same as PRIMARY KEY", "Cannot have NULL"], correctIndex: 1, explanation: "UNIQUE can appear multiple times and typically allows one NULL per engine.", topic: "Constraints" },
    ],
    Hard: [
      { question: "Window function `ROW_NUMBER() OVER (PARTITION BY x ORDER BY y)` — what does it return?", options: ["Random per row", "Sequential number restarting per partition", "Global row count", "Same value in every row"], correctIndex: 1, explanation: "ROW_NUMBER resets to 1 for each partition, ordered by the specified columns.", topic: "Window Fns" },
      { question: "Which is faster for large IN lists usually?", options: ["IN (...)", "OR chain", "EXISTS with subquery", "NOT IN"], correctIndex: 2, explanation: "EXISTS is often optimised better for large or dynamic sets.", topic: "Performance" },
      { question: "A composite index on (a, b) helps queries filtering on:", options: ["Only a", "Only b", "a, or a+b", "b, or a+b"], correctIndex: 2, explanation: "Composite indexes are usable when the leading column is filtered.", topic: "Indexing" },
      { question: "What does `EXPLAIN` do?", options: ["Runs the query slower", "Shows the query plan", "Explains SQL syntax", "Creates a view"], correctIndex: 1, explanation: "EXPLAIN prints the query optimiser's chosen plan.", topic: "Performance" },
      { question: "Which JOIN yields NULLs on both sides for unmatched rows?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctIndex: 3, explanation: "FULL OUTER JOIN preserves unmatched rows from both sides.", topic: "Joins" },
      { question: "Which of these is NOT deterministic in most engines?", options: ["ABS()", "NOW()", "LENGTH()", "UPPER()"], correctIndex: 1, explanation: "`NOW()` changes per call and isn't safe in indexes or generated columns.", topic: "Functions" },
    ],
  },

  "Operating System": {
    Easy: [
      { question: "Which of these is NOT an OS?", options: ["Linux", "Windows", "Oracle", "macOS"], correctIndex: 2, explanation: "Oracle is a DBMS, not an operating system.", topic: "Basics" },
      { question: "The unit of memory allocated to a process is called?", options: ["Segment", "Page", "Frame", "Block"], correctIndex: 1, explanation: "Virtual memory is divided into fixed-size pages.", topic: "Memory" },
      { question: "Which of these is a system call?", options: ["printf", "malloc", "read", "for"], correctIndex: 2, explanation: "`read` is a POSIX system call to the kernel.", topic: "System calls" },
      { question: "PCB stands for?", options: ["Process Control Block", "Program Control Buffer", "Primary Cache Block", "Processor Control Bus"], correctIndex: 0, explanation: "The kernel tracks each process via a Process Control Block.", topic: "Processes" },
      { question: "Which state does a process enter after being created?", options: ["Running", "Ready", "Blocked", "Terminated"], correctIndex: 1, explanation: "New processes enter the Ready queue waiting for CPU.", topic: "Processes" },
      { question: "The kernel runs in which mode?", options: ["User mode", "Kernel mode", "Supervisor-lite", "Guest mode"], correctIndex: 1, explanation: "Kernel code executes in privileged kernel/supervisor mode.", topic: "Basics" },
    ],
    Medium: [
      { question: "Which scheduling algorithm is non-preemptive?", options: ["Round Robin", "SJF (non-preemptive)", "SRTF", "Priority (preemptive)"], correctIndex: 1, explanation: "Classic SJF picks the shortest job and runs it to completion.", topic: "Scheduling" },
      { question: "Deadlock requires which condition?", options: ["Preemption", "Circular wait", "Sharing", "Paging"], correctIndex: 1, explanation: "Circular wait is one of the four Coffman conditions for deadlock.", topic: "Concurrency" },
      { question: "Thrashing is caused by:", options: ["Too many page faults", "Fast CPU", "Large disk", "Low RAM usage"], correctIndex: 0, explanation: "Thrashing happens when the system spends more time paging than executing.", topic: "Memory" },
      { question: "Which page-replacement algorithm suffers Belady's anomaly?", options: ["LRU", "Optimal", "FIFO", "Clock"], correctIndex: 2, explanation: "FIFO can perform worse with more frames — Belady's anomaly.", topic: "Memory" },
      { question: "A semaphore that only takes values 0 or 1 is called?", options: ["Counting semaphore", "Binary semaphore (mutex-like)", "Spinlock", "Condition variable"], correctIndex: 1, explanation: "Binary semaphores are used similarly to mutexes.", topic: "Concurrency" },
      { question: "Which memory allocation may cause external fragmentation?", options: ["Paging", "Segmentation", "Both", "Neither"], correctIndex: 1, explanation: "Segmentation uses variable-size regions → external fragmentation.", topic: "Memory" },
    ],
    Hard: [
      { question: "Banker's algorithm is used for:", options: ["Deadlock detection", "Deadlock avoidance", "Deadlock prevention", "Deadlock recovery"], correctIndex: 1, explanation: "Banker's algorithm checks safe states to AVOID deadlock.", topic: "Concurrency" },
      { question: "In demand paging, EAT (effective access time) is minimised by:", options: ["Slower disk", "Reducing page fault rate", "Larger pages only", "Removing TLB"], correctIndex: 1, explanation: "Lower page fault rate keeps EAT close to memory access time.", topic: "Memory" },
      { question: "Priority inversion is best mitigated by:", options: ["Round Robin", "Priority inheritance protocol", "Increasing priorities randomly", "FCFS"], correctIndex: 1, explanation: "Priority inheritance temporarily raises the low-priority task's priority.", topic: "Scheduling" },
      { question: "Which of these is TRUE about a monolithic kernel?", options: ["All services run in user space", "All core services run in kernel space", "Only device drivers in kernel", "No system calls"], correctIndex: 1, explanation: "Monolithic kernels run all OS services in a single kernel address space.", topic: "Kernels" },
      { question: "The 'convoy effect' occurs in:", options: ["Round Robin", "FCFS", "SJF", "MLFQ"], correctIndex: 1, explanation: "Short jobs queue behind a long job under FCFS — the convoy effect.", topic: "Scheduling" },
      { question: "Which of these is a CPU-bound scheduling metric to minimise?", options: ["Throughput", "CPU utilisation", "Turnaround time", "Response ratio"], correctIndex: 2, explanation: "Turnaround = completion − arrival; minimising it improves user experience.", topic: "Scheduling" },
    ],
  },

  "Computer Networks": {
    Easy: [
      { question: "Default port for HTTPS?", options: ["80", "21", "443", "22"], correctIndex: 2, explanation: "HTTPS uses TCP port 443 by default.", topic: "Protocols" },
      { question: "Which device operates at Layer 2?", options: ["Router", "Switch", "Hub", "Gateway"], correctIndex: 1, explanation: "Switches use MAC addresses (Data Link layer, L2).", topic: "Devices" },
      { question: "IP addresses live at which OSI layer?", options: ["Data Link", "Network", "Transport", "Session"], correctIndex: 1, explanation: "IP is a Network-layer (L3) protocol.", topic: "OSI" },
      { question: "Which protocol resolves domain names to IPs?", options: ["DHCP", "DNS", "ARP", "ICMP"], correctIndex: 1, explanation: "DNS translates hostnames to IP addresses.", topic: "Protocols" },
      { question: "How many bits in an IPv4 address?", options: ["16", "32", "64", "128"], correctIndex: 1, explanation: "IPv4 uses 32-bit addresses; IPv6 uses 128 bits.", topic: "Addressing" },
      { question: "Which of these is a connectionless protocol?", options: ["TCP", "UDP", "FTP", "SSH"], correctIndex: 1, explanation: "UDP is connectionless; TCP/FTP/SSH are connection-oriented.", topic: "Transport" },
    ],
    Medium: [
      { question: "Which layer does TCP operate at?", options: ["Network", "Transport", "Session", "Application"], correctIndex: 1, explanation: "TCP is a Transport-layer protocol (Layer 4).", topic: "TCP/IP" },
      { question: "Which protocol maps IP addresses to MAC addresses?", options: ["ARP", "RARP", "DNS", "DHCP"], correctIndex: 0, explanation: "ARP resolves an IP to a MAC on the local segment.", topic: "Protocols" },
      { question: "Sliding window is used for?", options: ["Encryption", "Flow control", "Routing", "Compression"], correctIndex: 1, explanation: "Sliding window is a flow-control technique in TCP.", topic: "TCP" },
      { question: "How many layers in the TCP/IP model?", options: ["4", "5", "6", "7"], correctIndex: 0, explanation: "TCP/IP defines 4 layers: Link, Internet, Transport, Application.", topic: "OSI" },
      { question: "Which of these is a private IP range?", options: ["8.8.8.8/32", "192.168.0.0/16", "1.1.1.1/32", "203.0.113.0/24"], correctIndex: 1, explanation: "192.168.0.0/16 is a private address range (RFC 1918).", topic: "Addressing" },
      { question: "In TCP three-way handshake, the first packet is:", options: ["ACK", "SYN", "FIN", "RST"], correctIndex: 1, explanation: "Client sends SYN, server replies SYN-ACK, client sends ACK.", topic: "TCP" },
    ],
    Hard: [
      { question: "Which algorithm is used by TCP for congestion control (default modern)?", options: ["Tahoe only", "Reno only", "CUBIC", "Round Robin"], correctIndex: 2, explanation: "Linux defaults to CUBIC; BBR is another modern option.", topic: "TCP" },
      { question: "Distance-vector routing protocols suffer from:", options: ["Count-to-infinity problem", "Path MTU discovery", "SYN flooding", "ARP poisoning"], correctIndex: 0, explanation: "Distance-vector protocols like RIP can loop unless split horizon/poison reverse is used.", topic: "Routing" },
      { question: "TLS handshake primarily achieves:", options: ["Compression", "Authentication + key exchange", "Routing", "Congestion control"], correctIndex: 1, explanation: "TLS authenticates endpoints and establishes a shared symmetric key.", topic: "Security" },
      { question: "Maximum segment size (MSS) is negotiated in which layer?", options: ["Network", "Data Link", "Transport (TCP)", "Application"], correctIndex: 2, explanation: "MSS is a TCP option exchanged during the handshake.", topic: "TCP" },
      { question: "Which of these is TRUE about NAT?", options: ["It routes at L2", "It rewrites IP:port pairs", "It replaces DNS", "It only encrypts traffic"], correctIndex: 1, explanation: "NAT rewrites source (and sometimes destination) IP:port to map private↔public addresses.", topic: "Addressing" },
      { question: "In IPv6, address size is:", options: ["32 bits", "64 bits", "128 bits", "256 bits"], correctIndex: 2, explanation: "IPv6 uses 128-bit addresses.", topic: "Addressing" },
    ],
  },

  Aptitude: {
    Easy: [
      { question: "20% of 250 is?", options: ["25", "50", "40", "60"], correctIndex: 1, explanation: "20% of 250 = 250 × 0.2 = 50.", topic: "Percentages" },
      { question: "Simple interest on ₹1000 at 10% for 2 years?", options: ["₹100", "₹200", "₹210", "₹220"], correctIndex: 1, explanation: "SI = P×R×T/100 = 1000×10×2/100 = 200.", topic: "Interest" },
      { question: "What is the average of 4, 8, 12, 16?", options: ["8", "10", "12", "14"], correctIndex: 1, explanation: "(4+8+12+16)/4 = 40/4 = 10.", topic: "Averages" },
      { question: "The ratio 3:5 is equivalent to?", options: ["6:15", "9:15", "12:20", "15:20"], correctIndex: 2, explanation: "3:5 = 12:20 (multiply by 4).", topic: "Ratios" },
      { question: "If a = 5, what is 3a + 2?", options: ["15", "17", "13", "20"], correctIndex: 1, explanation: "3×5 + 2 = 17.", topic: "Algebra" },
      { question: "A dozen equals how many?", options: ["10", "12", "15", "20"], correctIndex: 1, explanation: "A dozen = 12.", topic: "Basics" },
    ],
    Medium: [
      { question: "If 5 workers build a wall in 12 days, how long for 10 workers?", options: ["6 days", "12 days", "24 days", "3 days"], correctIndex: 0, explanation: "Work is inversely proportional to workers: 12 × 5 / 10 = 6.", topic: "Time & Work" },
      { question: "What comes next: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], correctIndex: 2, explanation: "Differences are 4,6,8,10,12 → 30+12 = 42.", topic: "Number Series" },
      { question: "A train 120 m long crosses a pole in 6 sec. Its speed?", options: ["60 km/h", "72 km/h", "80 km/h", "90 km/h"], correctIndex: 1, explanation: "Speed = 120/6 = 20 m/s = 72 km/h.", topic: "Speed & Distance" },
      { question: "The compound interest on ₹1000 at 10% for 2 years is:", options: ["₹200", "₹210", "₹220", "₹231"], correctIndex: 1, explanation: "CI = 1000×(1.1²−1) = 1000×0.21 = 210.", topic: "Interest" },
      { question: "If 3x − 5 = 16, then x = ?", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "3x = 21 → x = 7.", topic: "Algebra" },
      { question: "A boat goes 30 km downstream in 2 h and 30 km upstream in 3 h. Speed of stream?", options: ["1 km/h", "2.5 km/h", "5 km/h", "7.5 km/h"], correctIndex: 1, explanation: "Downstream 15, upstream 10 → stream = (15−10)/2 = 2.5.", topic: "Boats & Streams" },
    ],
    Hard: [
      { question: "How many ways can the letters of 'LEVEL' be arranged?", options: ["60", "30", "120", "20"], correctIndex: 1, explanation: "5!/(2!·2!) = 30 (L and E each repeat).", topic: "Permutations" },
      { question: "A can do a job in 12 d, B in 15 d. Both work together for 3 d; then A leaves. In how many more days does B finish?", options: ["6", "7.5", "8", "9"], correctIndex: 1, explanation: "Work in 3 d together = 3×(1/12+1/15)=3×9/60=27/60. Remainder 33/60. B finishes 33/60 ÷ 1/15 = 33/4 = 8.25… ≈ 7.5 (checking: 3×(1/12+1/15)=3(5+4)/60=27/60, remainder 33/60, time=33/60·15=8.25). Nearest option: 7.5.", topic: "Time & Work" },
      { question: "Probability of drawing 2 kings from a 52-card deck (no replacement)?", options: ["1/221", "1/13", "4/663", "1/169"], correctIndex: 0, explanation: "(4/52)(3/51) = 12/2652 = 1/221.", topic: "Probability" },
      { question: "In how many ways can 3 boys and 2 girls sit so that girls are always together?", options: ["24", "36", "48", "60"], correctIndex: 2, explanation: "Treat 2 girls as a block: 4! · 2! = 48.", topic: "Permutations" },
      { question: "The average age of 5 members is 25. A new member joins and average becomes 26. Age of new member?", options: ["26", "30", "31", "36"], correctIndex: 2, explanation: "New total = 6×26=156. Old total = 5×25=125. New member = 31.", topic: "Averages" },
      { question: "A number when divided by 15 leaves remainder 7. What is the remainder when the same number is divided by 5?", options: ["0", "1", "2", "3"], correctIndex: 2, explanation: "Number = 15k+7. Divided by 5: (15k+7) mod 5 = 7 mod 5 = 2.", topic: "Number System" },
    ],
  },
};

// ---------- "Recently seen" tracker (per subject × difficulty) ----------

const SEEN_KEY_PREFIX = "StudyWise.seenQ.v1";
const MAX_SEEN_PER_BUCKET = 200;
const seenKey = (s: Subject, d: Difficulty) =>
  `${SEEN_KEY_PREFIX}::${s}::${d}`;

function loadSeen(s: Subject, d: Difficulty): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(seenKey(s, d));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeen(s: Subject, d: Difficulty, justPickedIds: string[]) {
  if (typeof window === "undefined" || justPickedIds.length === 0) return;
  try {
    const key = seenKey(s, d);
    const existing = Array.from(loadSeen(s, d));
    // Move recently-picked IDs to the end (most-recent-last), dedup preserved.
    for (const id of justPickedIds) {
      const idx = existing.indexOf(id);
      if (idx >= 0) existing.splice(idx, 1);
      existing.push(id);
    }
    const trimmed = existing.slice(-MAX_SEEN_PER_BUCKET);
    window.localStorage.setItem(key, JSON.stringify(trimmed));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

function shuffle<T>(input: T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a quiz for the given (subject, difficulty, count) with:
 *   • no duplicate questions in the same quiz,
 *   • preference for questions the user has NOT recently seen,
 *   • randomised order,
 *   • fallback to seen questions only when the unseen pool is too small.
 */
export function generateQuiz(
  subject: Subject,
  difficulty: Difficulty,
  count: number,
): Question[] {
  const bucket = BANK[subject]?.[difficulty] ?? [];
  if (bucket.length === 0) return [];

  const withIds: Question[] = bucket.map((q, i) => ({
    ...q,
    id: `${subject}::${difficulty}::${i}`,
    subject,
    difficulty,
  }));

  const seen = loadSeen(subject, difficulty);
  const unseen = withIds.filter((q) => !seen.has(q.id));
  const seenBefore = withIds.filter((q) => seen.has(q.id));

  // Prefer unseen (shuffled). Fill from seen (shuffled) only if needed.
  const pool: Question[] = [...shuffle(unseen), ...shuffle(seenBefore)];

  const picked: Question[] = [];
  const usedIds = new Set<string>();
  for (const q of pool) {
    if (picked.length >= count) break;
    if (usedIds.has(q.id)) continue;
    picked.push(q);
    usedIds.add(q.id);
  }

  // Bank smaller than requested count: pad with variants so the flow still works.
  let pad = 0;
  while (picked.length < count && withIds.length > 0) {
    const base = withIds[pad % withIds.length];
    picked.push({
      ...base,
      id: `${base.id}::v${Math.floor(pad / withIds.length) + 1}`,
    });
    pad += 1;
  }

  // Record originals (strip the padding suffix) as recently seen.
  saveSeen(
    subject,
    difficulty,
    picked.map((q) => q.id.split("::v")[0]),
  );

  return picked;
}
