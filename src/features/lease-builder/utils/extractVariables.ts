export function extractVariables(json: any): string[] {
  const vars: string[] = [];
  const seen = new Set<string>();

  function walk(node: any) {
    if (node?.type === 'variableNode' && node.attrs?.id && !seen.has(node.attrs.id)) {
      seen.add(node.attrs.id);
      vars.push(node.attrs.id);
    }
    if (node?.content) node.content.forEach(walk);
  }

  walk(json);
  return vars;
}
