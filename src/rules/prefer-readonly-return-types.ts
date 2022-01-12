import type { TSESTree } from "@typescript-eslint/experimental-utils";
import type { ReadonlynessOptions } from "@typescript-eslint/type-utils";
import {
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
} from "@typescript-eslint/type-utils";
import { deepmerge } from "deepmerge-ts";
import type { JSONSchema4 } from "json-schema";

import type {
  AllowLocalMutationOption,
  IgnoreClassOption,
  IgnoreInferredTypesOption,
  IgnoreInterfaceOption,
  IgnorePatternOption,
} from "~/common/ignore-options";
import {
  allowLocalMutationOptionSchema,
  ignoreClassOptionSchema,
  ignoreInferredTypesOptionOptionSchema,
  ignoreInterfaceOptionSchema,
  ignorePatternOptionSchema,
  shouldIgnoreClass,
  shouldIgnoreInferredTypes,
  shouldIgnoreInterface,
  shouldIgnoreLocalMutation,
  shouldIgnorePattern,
} from "~/common/ignore-options";
import type { RuleContext, RuleMetaData, RuleResult } from "~/util/rule";
import { isReadonly, createRule } from "~/util/rule";
import { isFunctionLike, isTSFunctionType } from "~/util/typeguard";

// The name of this rule.
export const name = "prefer-readonly-return-types" as const;

// The options this rule can take.
type Options = AllowLocalMutationOption &
  IgnoreClassOption &
  IgnoreInferredTypesOption &
  IgnoreInterfaceOption &
  IgnorePatternOption &
  ReadonlynessOptions;

// The schema for the rule options.
const schema: JSONSchema4 = [
  deepmerge(
    allowLocalMutationOptionSchema,
    ignoreClassOptionSchema,
    ignoreInferredTypesOptionOptionSchema,
    ignoreInterfaceOptionSchema,
    ignorePatternOptionSchema,
    readonlynessOptionsSchema
  ),
];

// The default options for the rule.
const defaultOptions: Options = {
  ignoreClass: false,
  ignoreInterface: false,
  allowLocalMutation: false,
  ignoreInferredTypes: false,
  ...readonlynessOptionsDefaults,
};

// The possible error messages.
const errorMessages = {
  returnTypeShouldBeReadonly: "Return type should be readonly.",
} as const;

// The meta data for this rule.
const meta: RuleMetaData<keyof typeof errorMessages> = {
  type: "suggestion",
  docs: {
    description: "Prefer readonly return types over mutable one.",
    recommended: "error",
  },
  messages: errorMessages,
  fixable: "code",
  schema,
};

/**
 * Check if the given TypeAnnotation violates this rule.
 */
function checkTypeAnnotation(
  node: TSESTree.TSTypeAnnotation,
  context: RuleContext<keyof typeof errorMessages, Options>,
  options: Options
): RuleResult<keyof typeof errorMessages, Options> {
  if (
    !isReturnType(node) ||
    shouldIgnoreInferredTypes(node.typeAnnotation, context, options) ||
    shouldIgnoreClass(node.typeAnnotation, context, options) ||
    shouldIgnoreInterface(node.typeAnnotation, context, options) ||
    shouldIgnoreLocalMutation(node.typeAnnotation, context, options) ||
    shouldIgnorePattern(node.typeAnnotation, context, options) ||
    isReadonly(node.typeAnnotation, context, options)
  ) {
    return {
      context,
      descriptors: [],
    };
  }

  return {
    context,
    descriptors: [
      {
        node: node.typeAnnotation,
        messageId: "returnTypeShouldBeReadonly",
      },
    ],
  };
}

/**
 * Is the given node a return type?
 */
function isReturnType(node: TSESTree.TSTypeAnnotation) {
  return (
    node.parent !== undefined &&
    (isFunctionLike(node.parent) || isTSFunctionType(node.parent)) &&
    node.parent.returnType === node
  );
}

// Create the rule.
export const rule = createRule<keyof typeof errorMessages, Options>(
  name,
  meta,
  defaultOptions,
  {
    TSTypeAnnotation: checkTypeAnnotation,
  }
);
