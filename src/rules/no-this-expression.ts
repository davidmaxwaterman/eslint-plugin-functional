import type { TSESTree } from "@typescript-eslint/experimental-utils";
import type { JSONSchema4 } from "json-schema";

import type { RuleContext, RuleMetaData, RuleResult } from "~/util/rule";
import { createRule } from "~/util/rule";

// The name of this rule.
export const name = "no-this-expression" as const;

// The options this rule can take.
type Options = {};

// The schema for the rule options.
const schema: JSONSchema4 = [];

// The default options for the rule.
const defaultOptions: Options = {};

// The possible error messages.
const errorMessages = {
  generic: "Unexpected this, use functions not classes.",
} as const;

// The meta data for this rule.
const meta: RuleMetaData<keyof typeof errorMessages> = {
  type: "suggestion",
  docs: {
    description: "Disallow this access.",
    recommended: "error",
  },
  messages: errorMessages,
  schema,
};

/**
 * Check if the given ThisExpression violates this rule.
 */
function checkThisExpression(
  node: TSESTree.ThisExpression,
  context: RuleContext<keyof typeof errorMessages, Options>
): RuleResult<keyof typeof errorMessages, Options> {
  // All throw statements violate this rule.
  return { context, descriptors: [{ node, messageId: "generic" }] };
}

// Create the rule.
export const rule = createRule<keyof typeof errorMessages, Options>(
  name,
  meta,
  defaultOptions,
  {
    ThisExpression: checkThisExpression,
  }
);
