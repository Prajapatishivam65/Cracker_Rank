"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { xcodeLight } from "@uiw/codemirror-theme-xcode";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  height?: string;
  className?: string;
}

export default function CodeEditor({
  code,
  language,
  onChange,
  height = "100%",
  className = "",
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  // Prevent hydration errors with CodeMirror
  useEffect(() => {
    setMounted(true);
  }, []);

  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case "java":
        return java();
      case "cpp":
        return cpp();
      case "python":
        return python();
      default:
        return python();
    }
  };

  const getLanguageName = () => {
    switch (language.toLowerCase()) {
      case "java":
        return "Java";
      case "cpp":
        return "C++";
      case "python":
        return "Python";
      default:
        return "Python";
    }
  };

  const getLanguageIcon = () => {
    switch (language.toLowerCase()) {
      case "java":
        return "☕";
      case "cpp":
        return "🔧";
      case "python":
        return "🐍";
      default:
        return "📝";
    }
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-full w-full border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 animate-pulse",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>{getLanguageIcon()}</span>
            <span>{getLanguageName()}</span>
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isDarkTheme ? "bg-blue-400" : "bg-blue-600"
            )}
          ></span>
          {isDarkTheme ? "Dark Mode" : "Light Mode"}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          height={height}
          theme={isDarkTheme ? vscodeDark : xcodeLight}
          extensions={[getLanguageExtension()]}
          onChange={onChange}
          className="text-base"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {code.split("\n").length}{" "}
            {code.split("\n").length === 1 ? "line" : "lines"}
          </span>
          <span>•</span>
          <span className="font-mono">{code.length} characters</span>
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            Ctrl+S
          </kbd>{" "}
          to format
        </div>
      </div>
    </div>
  );
}
