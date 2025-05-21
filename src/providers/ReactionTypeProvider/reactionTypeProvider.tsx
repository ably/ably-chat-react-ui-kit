import { MessageReactionType } from '@ably/chat';
import React, { createContext, ReactNode, useCallback, useState } from 'react';

function getReactionTypeContext() {
  const doNothing: (type: MessageReactionType) => void = (_: MessageReactionType) => void 0;
  return createContext({ type: MessageReactionType.Distinct, setType: doNothing });
}

export const ReactionTypeContext = getReactionTypeContext();

/**
 * Props for the {@link ReactionTypeProvider} component.
 */
export interface ReactionTypeProviderProps {
  /**
   * The child components to be rendered within this provider.
   */
  children?: ReactNode | ReactNode[] | null;

  /**
   * The default reaction type to be used by the provider.
   */
  defaultType?: MessageReactionType;
}

export const allowedMessageReactionTypes = [
  MessageReactionType.Unique as string,
  MessageReactionType.Distinct as string,
  MessageReactionType.Multiple as string,
];

/**
 * A React context provider component that manages the state for the active reaction type in messages.
 *
 * The `ReactionTypeProvider` initializes the active reaction type based on a stored value in the browser's
 * localStorage. If a valid reaction type is found in localStorage and matches one of the allowed types,
 * it sets this as the default type. Otherwise, it defaults to the `MessageReactionType.Unique` type.
 *
 * It provides the active reaction type and a method to update the reaction type via the context API.
 * The provided `setType` method validates that the new reaction type is allowed and updates localStorage
 * alongside the component's internal state.
 *
 * Props:
 *   children (React.ReactNode): The components within this provider will have access to the context value.
 *   defaultType (MessageReactionType): The default reaction type to be used by the provider. If not provided,
 *   it will be set to `MessageReactionType.Unique`.
 *
 * Context Value Shape:
 *   type (MessageReactionType): The current active reaction type.
 *   setType (function): A method to update the active reaction type. Throws an error if the provided type
 *   is invalid or not part of allowed types.
 *
 * Dependencies:
 *   - `MessageReactionType`: Enum representing the valid reaction types.
 *   - `allowedMessageReactionTypes`: Array of allowed reaction type values.
 *   - `ReactionTypeContext`: React context used for providing the active reaction type and `setType`.
 */
export const ReactionTypeProvider = ({
  children,
  defaultType = MessageReactionType.Unique,
}: ReactionTypeProviderProps) => {
  const [reactionType, setReactionType] = useState<MessageReactionType>(defaultType);

  const setReactionTypeWithValidation = useCallback(
    (rt: MessageReactionType) => {
      const validatedType = validateAndTransformReactionType(rt);
      setReactionType(validatedType);
    },
    [setReactionType]
  );

  const value = {
    type: reactionType,
    setType: setReactionTypeWithValidation,
  };

  return <ReactionTypeContext.Provider value={value}>{children}</ReactionTypeContext.Provider>;
};

// Shortcuts for reaction types
const reactionTypeShortcuts: Record<string, MessageReactionType> = {
  unique: MessageReactionType.Unique,
  distinct: MessageReactionType.Distinct,
  multiple: MessageReactionType.Multiple,
};

// Helper function to validate and transform reaction types
function validateAndTransformReactionType(rt: MessageReactionType): MessageReactionType {
  if (reactionTypeShortcuts.hasOwnProperty(rt)) {
    rt = reactionTypeShortcuts[rt];
  }
  if (!allowedMessageReactionTypes.includes(rt)) {
    throw new Error(
      `Invalid reaction type. Must be one of ${allowedMessageReactionTypes.join(', ')}`
    );
  }
  return rt;
}
