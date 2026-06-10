import type { FileDiff } from "~/types/diff";
import { fileHasTodoMarker, TODO_MARKERS } from "~/lib/todo-marker";

interface TreeDir {
  type: "dir";
  name: string;
  children: TreeNode[];
}

interface TreeFile {
  type: "file";
  name: string;
  file: FileDiff;
}

type TreeNode = TreeDir | TreeFile;

function buildTree(files: FileDiff[]): TreeNode[] {
  const root: TreeDir = { type: "dir", name: "", children: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) {
      let next = dir.children.find(
        (c): c is TreeDir => c.type === "dir" && c.name === part,
      );
      if (!next) {
        next = { type: "dir", name: part, children: [] };
        dir.children.push(next);
      }
      dir = next;
    }
    dir.children.push({ type: "file", name: parts[parts.length - 1], file });
  }
  return root.children;
}

const STATUS_DOT: Record<FileDiff["status"], string> = {
  added: "text-[#1a7f37]",
  modified: "text-[#9a6700]",
  deleted: "text-[#cf222e]",
  renamed: "text-[#57606a]",
};

interface FileTreeProps {
  files: FileDiff[];
  onSelect: (path: string) => void;
}

export function FileTree({ files, onSelect }: FileTreeProps) {
  const tree = buildTree(files);
  return (
    <nav className="w-72 shrink-0">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-4 pr-2">
        <TreeLevel nodes={tree} depth={0} onSelect={onSelect} />
      </div>
    </nav>
  );
}

function TreeLevel({
  nodes,
  depth,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  onSelect: (path: string) => void;
}) {
  return (
    <ul>
      {nodes.map((node) =>
        node.type === "dir" ? (
          <li key={`dir:${node.name}`}>
            <div
              className="flex items-center gap-1 py-1 text-sm text-[#57606a]"
              style={{ paddingLeft: depth * 12 }}
            >
              <span className="select-none">📁</span>
              <span>{node.name}</span>
            </div>
            <TreeLevel
              nodes={node.children}
              depth={depth + 1}
              onSelect={onSelect}
            />
          </li>
        ) : (
          <li key={`file:${node.file.path}`}>
            <button
              type="button"
              onClick={() => onSelect(node.file.path)}
              className={`flex w-full items-center gap-1.5 rounded-md py-1 text-left text-sm text-[#1f2328] ${
                fileHasTodoMarker(node.file)
                  ? "bg-[#ffebe9] hover:bg-[#ffd8d3]"
                  : "hover:bg-[#eef1f4]"
              }`}
              style={{ paddingLeft: depth * 12 }}
              title={node.file.path}
            >
              <span
                className={`select-none font-mono font-bold ${STATUS_DOT[node.file.status]}`}
              >
                •
              </span>
              <span className="truncate font-mono text-xs">{node.name}</span>
              {fileHasTodoMarker(node.file) && (
                <span
                  className="select-none text-xs"
                  title={`Contains ${TODO_MARKERS} in added lines`}
                >
                  ⚠️
                </span>
              )}
              {!node.file.binary && (
                <span className="ml-auto shrink-0 pr-1 text-[10px]">
                  <span className="text-[#1a7f37]">+{node.file.additions}</span>{" "}
                  <span className="text-[#cf222e]">−{node.file.deletions}</span>
                </span>
              )}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
