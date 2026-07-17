import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileText, Newspaper, PlayCircle, ExternalLink } from "lucide-react";
import { SUBJECTS, type Subject } from "../lib/quiz-data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — StudyWise" },
      { name: "description", content: "Curated study resources for placement prep." },
    ],
  }),
  component: ResourcesPage,
});

interface ResourceLink {
  label: string;
  url: string;
}

const DATA: Record<Subject, { notes: ResourceLink[]; articles: ResourceLink[]; practice: ResourceLink[]; videos: ResourceLink[] }> = {
  Java: {
    notes: [{ label: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/" }],
    articles: [{ label: "GeeksforGeeks Java", url: "https://www.geeksforgeeks.org/java/" }],
    practice: [{ label: "HackerRank Java", url: "https://www.hackerrank.com/domains/java" }],
    videos: [{ label: "Java Placement Playlist", url: "https://www.youtube.com/results?search_query=java+placement+interview" }],
  },
  "Data Structures & Algorithms": {
    notes: [{ label: "CP Algorithms", url: "https://cp-algorithms.com/" }],
    articles: [{ label: "GfG DSA", url: "https://www.geeksforgeeks.org/data-structures/" }],
    practice: [{ label: "LeetCode Top 150", url: "https://leetcode.com/studyplan/top-interview-150/" }],
    videos: [{ label: "DSA Playlist", url: "https://www.youtube.com/results?search_query=dsa+placement+playlist" }],
  },
  DBMS: {
    notes: [{ label: "GfG DBMS Notes", url: "https://www.geeksforgeeks.org/dbms/" }],
    articles: [{ label: "TutorialsPoint DBMS", url: "https://www.tutorialspoint.com/dbms/" }],
    practice: [{ label: "InterviewBit DBMS", url: "https://www.interviewbit.com/dbms-interview-questions/" }],
    videos: [{ label: "DBMS Placement", url: "https://www.youtube.com/results?search_query=dbms+placement" }],
  },
  SQL: {
    notes: [{ label: "W3Schools SQL", url: "https://www.w3schools.com/sql/" }],
    articles: [{ label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" }],
    practice: [{ label: "HackerRank SQL", url: "https://www.hackerrank.com/domains/sql" }],
    videos: [{ label: "SQL Placement", url: "https://www.youtube.com/results?search_query=sql+placement" }],
  },
  "Operating System": {
    notes: [{ label: "OS Notes GfG", url: "https://www.geeksforgeeks.org/operating-systems/" }],
    articles: [{ label: "OSTEP Book", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" }],
    practice: [{ label: "OS MCQs", url: "https://www.indiabix.com/technical/operating-systems-concepts/" }],
    videos: [{ label: "OS Placement", url: "https://www.youtube.com/results?search_query=operating+system+placement" }],
  },
  "Computer Networks": {
    notes: [{ label: "GfG Networks", url: "https://www.geeksforgeeks.org/computer-network-tutorials/" }],
    articles: [{ label: "Kurose & Ross", url: "https://gaia.cs.umass.edu/kurose_ross/" }],
    practice: [{ label: "CN MCQs", url: "https://www.indiabix.com/technical/networking/" }],
    videos: [{ label: "CN Placement", url: "https://www.youtube.com/results?search_query=computer+networks+placement" }],
  },
  Aptitude: {
    notes: [{ label: "IndiaBIX Aptitude", url: "https://www.indiabix.com/aptitude/questions-and-answers/" }],
    articles: [{ label: "GfG Aptitude", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/" }],
    practice: [{ label: "Practice Sets", url: "https://www.indiabix.com/aptitude/" }],
    videos: [{ label: "Aptitude Playlist", url: "https://www.youtube.com/results?search_query=aptitude+placement" }],
  },
};

function ResourcesPage() {
  return (
    <main className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Study <span className="gradient-text">resources</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Handpicked notes, articles, practice sets, and videos for every subject.
        </p>

        <div className="mt-8 space-y-6">
          {SUBJECTS.map((subject) => (
            <section key={subject} className="glass rounded-[22px] p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">{subject}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResourceGroup title="Notes" icon={<BookOpen className="h-4 w-4" />} items={DATA[subject].notes} />
                <ResourceGroup title="Articles" icon={<Newspaper className="h-4 w-4" />} items={DATA[subject].articles} />
                <ResourceGroup title="Practice sets" icon={<FileText className="h-4 w-4" />} items={DATA[subject].practice} />
                <ResourceGroup title="Videos" icon={<PlayCircle className="h-4 w-4" />} items={DATA[subject].videos} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function ResourceGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: ResourceLink[] }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.url}>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-white"
            >
              <span className="truncate">{it.label}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
