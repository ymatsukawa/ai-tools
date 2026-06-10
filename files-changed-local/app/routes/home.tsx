import type { Route } from "./+types/home";
import type { LoaderResult } from "~/types/diff";
import {
  GitError,
  currentBranch,
  diffNameStatus,
  diffPatch,
  listBranches,
  validateRepo,
} from "~/lib/git.server";
import { parseDiff } from "~/lib/diff-parser";
import { RepoForm } from "~/components/RepoForm";
import { ErrorAlert } from "~/components/ErrorAlert";
import { DiffStatsBar } from "~/components/DiffStatsBar";
import { FileTree } from "~/components/FileTree";
import { FileDiffSection } from "~/components/FileDiffSection";
import { useCollapsedFiles } from "~/hooks/useCollapsedFiles";
import { useScrollToFile } from "~/hooks/useScrollToFile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "files-changed-local" },
    {
      name: "description",
      content: "GitHub-style files changed view for local git branches",
    },
  ];
}

export async function loader({
  request,
}: Route.LoaderArgs): Promise<LoaderResult> {
  const url = new URL(request.url);
  const repoPath = url.searchParams.get("repo")?.trim() ?? "";
  if (!repoPath) return { stage: "empty" };

  const invalid = await validateRepo(repoPath);
  if (invalid) return { stage: "error", message: invalid, repoPath };

  const [branches, current] = await Promise.all([
    listBranches(repoPath),
    currentBranch(repoPath),
  ]);
  const shared = { repoPath, branches, currentBranch: current };

  const baseParam = url.searchParams.get("base");
  const headParam = url.searchParams.get("head");

  const base =
    baseParam ??
    (branches.includes("main")
      ? "main"
      : branches.includes("master")
        ? "master"
        : null);
  if (!base) {
    return {
      stage: "error",
      message:
        "No 'main' or 'master' branch found. Select a base branch explicitly.",
      ...shared,
    };
  }
  const head = headParam ?? current;
  if (!head) {
    return {
      stage: "error",
      message: "HEAD is detached. Select a compare branch explicitly.",
      ...shared,
    };
  }

  // Injection guard: only branch names that exist in the repo are accepted.
  for (const ref of [base, head]) {
    if (!branches.includes(ref)) {
      return {
        stage: "error",
        message: `Branch "${ref}" not found in this repository.`,
        ...shared,
      };
    }
  }

  if (base === head) {
    return {
      stage: "ready",
      ...shared,
      base,
      head,
      files: [],
      totalAdditions: 0,
      totalDeletions: 0,
    };
  }

  try {
    const [nameStatus, patch] = await Promise.all([
      diffNameStatus(repoPath, base, head),
      diffPatch(repoPath, base, head),
    ]);
    const files = parseDiff(patch, nameStatus);
    return {
      stage: "ready",
      ...shared,
      base,
      head,
      files,
      totalAdditions: files.reduce((n, f) => n + f.additions, 0),
      totalDeletions: files.reduce((n, f) => n + f.deletions, 0),
    };
  } catch (e) {
    const message =
      e instanceof GitError
        ? /no merge base/i.test(e.message)
          ? "These branches have unrelated histories (no merge base)."
          : e.message
        : "Failed to compute diff.";
    return { stage: "error", message, ...shared, base, head };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  const branches = data.stage === "empty" ? [] : (data.branches ?? []);
  const repoPath = data.stage === "empty" ? "" : data.repoPath;
  const base = data.stage === "empty" ? null : (data.base ?? null);
  const head =
    data.stage === "empty"
      ? null
      : (data.head ?? data.currentBranch ?? null);

  return (
    <main className="min-h-screen bg-white">
      <RepoForm repoPath={repoPath} branches={branches} base={base} head={head} />
      {data.stage === "empty" && (
        <p className="px-4 py-10 text-sm text-[#57606a]">
          Click "Open Folder" and select a local git repository to compare
          branches.
        </p>
      )}
      {data.stage === "error" && <ErrorAlert message={data.message} />}
      {data.stage === "ready" && <CompareView data={data} />}
    </main>
  );
}

function CompareView({
  data,
}: {
  data: Extract<LoaderResult, { stage: "ready" }>;
}) {
  const compareKey = `${data.repoPath}|${data.base}|${data.head}`;
  const { isCollapsed, toggle, expand, collapseAll, expandAll } =
    useCollapsedFiles(data.files, compareKey);
  const { registerRef, scrollToFile } = useScrollToFile();

  if (data.files.length === 0) {
    return (
      <p className="px-4 py-10 text-sm text-[#57606a]">
        There isn't anything to compare. <strong>{data.base}</strong> and{" "}
        <strong>{data.head}</strong> are identical.
      </p>
    );
  }

  return (
    <div className="px-4">
      <DiffStatsBar
        fileCount={data.files.length}
        totalAdditions={data.totalAdditions}
        totalDeletions={data.totalDeletions}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />
      <div className="flex gap-4">
        <FileTree
          files={data.files}
          onSelect={(path) => {
            expand(path);
            // Wait a frame so the expanded section has its final height.
            requestAnimationFrame(() => scrollToFile(path));
          }}
        />
        <div className="min-w-0 flex-1">
          {data.files.map((file) => (
            <FileDiffSection
              key={file.path}
              file={file}
              collapsed={isCollapsed(file.path)}
              onToggle={() => toggle(file.path)}
              registerRef={registerRef(file.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
