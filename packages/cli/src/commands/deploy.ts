export function deployCommand(_file: string): number {
  console.error("newt deploy is not available yet. Closed beta requires Newt Cloud auth, token encryption, and container orchestration first.");
  console.error("For now, use: newt build <file> --out dist");
  return 2;
}
