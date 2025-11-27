import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  InitializeParams,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

let workspaceRoot: string | null = null;

/**
 * Debounces a function, ensuring it is only called after a specified wait period
 * since the last time it was invoked.
 * @param func The function to debounce.
 * @param wait The time to wait in milliseconds.
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    const later = () => {
      timeout = null;
      func.apply(context, args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

function uriToPath(uri: string): string {
  const url = new URL(uri);
  // Decode the path and then use path.normalize to fix slashes and drive letters
  let fsPath = decodeURIComponent(url.pathname);

  if (
    process.platform === "win32" &&
    fsPath.startsWith("/") &&
    fsPath.match(/^\/[a-zA-Z]:\//)
  ) {
    fsPath = fsPath.substring(1);
  }

  return path.normalize(fsPath);
}

connection.onInitialize((params: InitializeParams) => {
  workspaceRoot = params.rootUri ? uriToPath(params.rootUri) : null;

  connection.console.info(`Workspace Root set to: ${workspaceRoot}`);

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: 1,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: false,
      },
    },
  };

  return result;
});

connection.languages.diagnostics.on(async (params) => {
  const doc = documents.get(params.textDocument.uri);

  if (!doc) {
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: [],
    };
  }

  const diagnostics = await runRgbdsDiagnostics(doc);

  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: diagnostics,
  } satisfies DocumentDiagnosticReport;
});

// Create a debounced function for validation on content change (500ms delay)
const debouncedValidate = debounce((document: TextDocument) => {
  runRgbdsDiagnostics(document).then((diags) => {
    connection.sendDiagnostics({
      uri: document.uri,
      diagnostics: diags,
    });
  });
}, 500); // Wait 500ms after last change before running the expensive 'make' command

// Use the debounced function on content change for fast feedback
documents.onDidChangeContent((change) => {
  debouncedValidate(change.document);
});

async function runRgbdsDiagnostics(
  document: TextDocument,
): Promise<Diagnostic[]> {
  if (!workspaceRoot) {
    return [];
  }

  connection.sendDiagnostics({
    uri: document.uri,
    diagnostics: [],
  });

  const filePath = uriToPath(document.uri);
  const relativeFilePath = path.relative(workspaceRoot, filePath);

  const makefileExists = fs.existsSync(path.join(workspaceRoot, "Makefile"));

  const cmd = makefileExists
    ? "make clean -s && make -s"
    : `rgbasm -Weverything -o /dev/null ${filePath}`; // Fallback to single-file assembly

  return new Promise((resolve) => {
    exec(cmd, { cwd: workspaceRoot! }, (err, stdout, stderr) => {
      // If the command itself failed to execute (e.g., 'make' not found)
      if (err && err.code !== 0) {
        connection.console.error(
          `Error running command '${cmd}': ${err.message}`,
        );
      }

      const output = stdout + "\n" + stderr;
      const diagnostics = parseRgbdsOutput(output, document, relativeFilePath);

      resolve(diagnostics);
    });
  });
}

function parseRgbdsOutput(
  output: string,
  document: TextDocument,
  relativeFilePath: string,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  // Filter out empty lines for cleaner parsing
  const lines = output.split("\n").filter((line) => line.trim().length > 0);

  // Regex 1: Targets the file/line part: "error: src/header.asm(74): [Optional Message]"
  // Groups: [full, severity, file, lineNum, messagePart1]
  const singleLineRegex = /(error|warning):\s*(.*?)\((\d+)\):\s*(.*)/;

  // Regex 2: Targets the indented error message on the next line
  // Example: "    Macro "asdf" not defined"
  const messageOnlyRegex = /^\s{4,}(.*)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(singleLineRegex);

    if (match) {
      const [, severity, file, lineNumStr, messagePart1] = match;
      let finalMessage = messagePart1.trim();

      // Check for two-line error structure:
      // 1. The first line had no message (or only whitespace).
      // 2. There is a next line.
      if (finalMessage === "" && i + 1 < lines.length) {
        const nextLineMatch = lines[i + 1].match(messageOnlyRegex);
        if (nextLineMatch) {
          // Append the message from the next line
          finalMessage = nextLineMatch[1].trim();
          i++; // Consume the next line so it's not processed again
        }
      }

      const normalizedFile = path.normalize(file);

      // Only show diagnostics for the current file
      if (!relativeFilePath.endsWith(normalizedFile)) {
        continue;
      }

      const lineIndex = parseInt(lineNumStr, 10) - 1;

      const diagnosticMessage =
        finalMessage || `Unknown ${severity} reported by rgbasm.`;

      diagnostics.push({
        severity:
          severity === "error"
            ? DiagnosticSeverity.Error
            : DiagnosticSeverity.Warning,

        range: {
          // Assume the error is for the entire line, starting at column 0
          start: { line: lineIndex, character: 0 },
          end: { line: lineIndex, character: 999 },
        },

        source: "rgbasm",
        message: diagnosticMessage,
      });
    }
  }

  return diagnostics;
}

documents.listen(connection);
connection.listen();
