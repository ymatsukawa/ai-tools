import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/home";
import { BodyTab } from "../components/BodyTab";
import { ConfirmModal } from "../components/ConfirmModal";
import { CurlOutput } from "../components/CurlOutput";
import { HeadersTab } from "../components/HeadersTab";
import { MethodUrlBar } from "../components/MethodUrlBar";
import { Tabs, type TabDef } from "../components/Tabs";
import { OptionsTab } from "../components/OptionsTab";
import { TestResult } from "../components/TestResult";
import { UrlEncodeTab } from "../components/UrlEncodeTab";
import { useCurlForm } from "../hooks/useCurlForm";
import { useTestConfirm } from "../hooks/useTestConfirm";
import { generateCurlCommand, type CurlConfig } from "../utils/curl";
import {
  executeTestRequest,
  type TestResult as TestResultData,
} from "../utils/testRequest.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "curl Generator" },
    {
      name: "description",
      content: "Build curl commands by selecting options in the browser",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const config = (await request.json()) as CurlConfig;
  return await executeTestRequest(config);
}

type TabId = "header" | "body" | "etc" | "urlencode";

const TABS: TabDef<TabId>[] = [
  { id: "header", label: "Header" },
  { id: "body", label: "Body" },
  { id: "etc", label: "etc" },
  { id: "urlencode", label: "url encode" },
];

export default function Home() {
  const form = useCurlForm();
  const { config, update } = form;
  const [activeTab, setActiveTab] = useState<TabId>("header");
  const fetcher = useFetcher<TestResultData>();
  const { pendingHost, requestTest, confirm, cancel } = useTestConfirm();

  const urlFilled = config.url.trim() !== "";
  const testing = fetcher.state !== "idle";
  const command = urlFilled ? generateCurlCommand(config) : null;

  function handleTest() {
    requestTest(config.url.trim(), () => {
      fetcher.submit(JSON.stringify(config), {
        method: "post",
        encType: "application/json",
      });
    });
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">curl Generator</h1>

      <MethodUrlBar
        method={config.method}
        url={config.url}
        onMethodChange={(method) => update("method", method)}
        onUrlChange={(url) => update("url", url)}
      />

      <div>
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <div className="border border-t-0 border-gray-300 dark:border-gray-700 rounded-b-md p-4">
          {activeTab === "header" && <HeadersTab form={form} />}
          {activeTab === "body" && <BodyTab form={form} />}
          {activeTab === "etc" && <OptionsTab form={form} />}
          {activeTab === "urlencode" && <UrlEncodeTab />}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={!urlFilled || testing}
          className="px-6 py-2 rounded-md border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testing ? "Testing…" : "Test"}
        </button>
      </div>

      {command !== null && <CurlOutput command={command} />}

      {fetcher.data && !testing && <TestResult result={fetcher.data} />}

      {pendingHost !== null && (
        <ConfirmModal target={pendingHost} onConfirm={confirm} onCancel={cancel} />
      )}
    </main>
  );
}
