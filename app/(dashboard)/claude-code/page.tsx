/**
 * Legacy route redirect: /claude-code → /developer-ai-tools/claude-code
 * The Claude Code analytics page moved to /developer-ai-tools/claude-code in Phase 2A.
 */
import { redirect } from "next/navigation";

export default function ClaudeCodeRedirect() {
  redirect("/developer-ai-tools/claude-code");
}
