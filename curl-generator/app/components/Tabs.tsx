export interface TabDef<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function Tabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div
      role="tablist"
      className="flex gap-1 border-b border-gray-300 dark:border-gray-700"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-t-md border border-b-0 -mb-px ${
            tab.id === active
              ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold border-b-white dark:border-b-gray-900"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
