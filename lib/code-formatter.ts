import prettier from "prettier";
import parserJava from "prettier-plugin-java";

export async function formatCode(
  code: string,
  language: string
): Promise<string> {
  // Handle empty code case
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    if (language === "java") {
      const formattedCode = await prettier.format(code, {
        parser: "java",
        plugins: [parserJava],
        tabWidth: 4,
        useTabs: false,
      });
      return formattedCode;
    } else if (language === "cpp") {
      // Enhanced indentation-based formatter for C++
      return formatCpp(code);
    } else if (language === "python") {
      // Python formatting using indentation rules
      return formatPython(code);
    } else {
      // For unsupported languages, return the original code instead of throwing
      console.warn(`Formatting not supported for language: ${language}`);
      return code;
    }
  } catch (error) {
    console.error(`Error formatting ${language} code:`, error);
    // Return original code instead of throwing to avoid breaking the editor
    return code;
  }
}

function formatCpp(code: string): string {
  const lines = code.split("\n");
  let indentLevel = 0;
  const formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Preserve empty lines
    if (line === "") {
      formattedLines.push("");
      continue;
    }

    // Check for closing braces at start of line
    if (line.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Format the current line with proper indentation
    const indentedLine = "    ".repeat(indentLevel) + line;
    formattedLines.push(indentedLine);

    // Check for opening braces at end of line to increase indent for next line
    const openBraceCount = (line.match(/{/g) || []).length;
    const closeBraceCount = (line.match(/}/g) || []).length;

    // Adjust indent level for next line
    indentLevel += openBraceCount - closeBraceCount;

    // If line ends with an opening brace and the next line isn't just a closing brace,
    // increase the indent level
    if (
      line.endsWith("{") &&
      i < lines.length - 1 &&
      !lines[i + 1].trim().startsWith("}")
    ) {
      indentLevel++;
    }

    // Ensure indentLevel doesn't go negative
    indentLevel = Math.max(0, indentLevel);
  }

  return formattedLines.join("\n");
}

function formatPython(code: string): string {
  const lines = code.split("\n");
  let indentLevel = 0;
  const formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Preserve empty lines
    if (line === "") {
      formattedLines.push("");
      continue;
    }

    // Check for dedent keywords
    if (
      line.startsWith("else:") ||
      line.startsWith("elif ") ||
      line.startsWith("except") ||
      line.startsWith("finally:")
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Format the current line with proper indentation
    const indentedLine = "    ".repeat(indentLevel) + line;
    formattedLines.push(indentedLine);

    // Check for indent keywords
    if (line.endsWith(":")) {
      indentLevel++;
    }
  }

  return formattedLines.join("\n");
}
