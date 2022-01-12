import type { TSESTree } from "@typescript-eslint/experimental-utils";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";

/**
 * Higher order function to check if the two given values are the same.
 */
export function isExpected<T>(expected: T): (actual: T) => boolean {
  return (actual) => actual === expected;
}

/**
 * Does the given ExpressionStatement specify directive prologues.
 */
export function isDirectivePrologue(
  node: TSESTree.ExpressionStatement
): boolean {
  return (
    node.expression.type === AST_NODE_TYPES.Literal &&
    typeof node.expression.value === "string" &&
    node.expression.value.startsWith("use ")
  );
}
