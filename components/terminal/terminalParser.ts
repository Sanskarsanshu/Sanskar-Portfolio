import { COMMANDS, type CommandOutput } from "./terminalCommands";

export interface ParsedCommand {
  command: string;
  args: string[];
  original: string;
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  
  return {
    command: parts[0]?.toLowerCase() || "",
    args: parts.slice(1),
    original: trimmed,
  };
}

export function executeCommand(input: string): CommandOutput {
  const parsed = parseCommand(input);
  
  if (!parsed.command) {
    return "";
  }
  
  const cmd = COMMANDS[parsed.command];
  
  if (cmd) {
    try {
      return cmd.execute(parsed.args);
    } catch (e) {
      return { type: "system", message: `Command execution failed: ${parsed.command}` };
    }
  } else {
    return { type: "system", message: `command not found: ${parsed.command}\n\nType "help" to see available commands.` };
  }
}

export function getAutocompleteSuggestion(input: string, dictionary: string[]): string {
  const parsed = parseCommand(input);
  const target = parsed.args.length > 0 ? parsed.args[parsed.args.length - 1] : parsed.command;
  
  if (!target) return input;
  
  const match = dictionary.find(term => term.startsWith(target.toLowerCase()));
  
  if (match) {
    if (parsed.args.length > 0) {
      // Reconstruct with args
      const prevArgs = parsed.args.slice(0, -1).join(" ");
      return `${parsed.command} ${prevArgs ? prevArgs + " " : ""}${match}`;
    } else {
      return match;
    }
  }
  
  return input;
}
