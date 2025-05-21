import { Message, MessageReactionType, Messages } from '@ably/chat';
import { ReactionButton } from './ReactionButton';
import React from 'react';

interface MessageReactionsProps {
  message: Message;
  clientId: string;
  reactionType: MessageReactionType;
  onReactionAdd: Messages['reactions']['add'];
  onReactionDelete: Messages['reactions']['delete'];
  className?: string;
  emojis?: string[];
}

export function MessageReactions({
  message,
  clientId,
  reactionType,
  onReactionAdd,
  onReactionDelete,
  className = '',
  emojis = ['👍', '❤️', '🔥', '🚀'],
}: MessageReactionsProps) {
  // Get the appropriate reactions object based on the reaction type
  const getReactions = () => {
    switch (reactionType) {
      case MessageReactionType.Unique:
        return message.reactions.unique ?? {};
      case MessageReactionType.Distinct:
        return message.reactions.distinct ?? {};
      case MessageReactionType.Multiple:
        return message.reactions.multiple ?? {};
      default:
        return {};
    }
  };

  const reactions = getReactions();

  // Add any emojis from the reactions that aren't in the default list
  const allEmojis = [...emojis];
  for (const emoji in reactions) {
    if (!allEmojis.includes(emoji)) {
      allEmojis.push(emoji);
    }
  }

  // Handle reaction click based on the reaction type
  const handleReactionClick = (emoji: string) => {
    if (reactionType === MessageReactionType.Multiple) {
      // Multiple reactions always add
      onReactionAdd(message, {type: reactionType, name: emoji})
    } else {
      // Unique and Distinct reactions toggle
      if ((reactions[emoji] as { clientIds: string[] })?.clientIds.includes(clientId)) {
        onReactionDelete(message, { type: reactionType, name: emoji });
      } else {
        onReactionAdd(message, { type: reactionType, name: emoji });
      }
    }
  };

  // Handle right-click for Multiple reactions
  const handleReactionContextMenu = (emoji: string) => {
    if (reactionType === MessageReactionType.Multiple) {
      onReactionDelete(message, { type: reactionType, name: emoji });
    }
  };

  return (
    <div className={`reaction-container ${className}`}>
      {allEmojis.map((emoji) => (
        <ReactionButton
          key={emoji}
          emoji={emoji}
          count={reactions[emoji]?.total || 0}
          onClick={handleReactionClick}
          onContextMenu={
            reactionType === MessageReactionType.Multiple ? handleReactionContextMenu : undefined
          }
        />
      ))}
    </div>
  );
}
