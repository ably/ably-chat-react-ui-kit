import { Message, MessageReactionType, Messages } from '@ably/chat';
import { ReactionButton } from './ReactionButton';
import { EmojiPicker } from './EmojiPicker';
import React from 'react';

interface MessageReactionsProps {
  message: Message;
  clientId: string;
  reactionType: MessageReactionType;
  onReactionAdd: Messages['reactions']['add'];
  onReactionDelete: Messages['reactions']['delete'];
  className?: string;
}

export function MessageReactions({
  message,
  clientId,
  reactionType,
  onReactionAdd,
  onReactionDelete,
  className = '',
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

  // Convert reactions object to array and sort by first reaction time
  const sortedReactions = Object.entries(reactions)
    .map(([emoji, data]) => ({
      emoji,
      count: (data as { total: number }).total,
      hasReacted: (data as { clientIds: string[] }).clientIds.includes(clientId),
    }))
    .sort((a, b) => a.emoji.localeCompare(b.emoji));

  const handleReactionClick = (emoji: string) => {
    if ((reactions[emoji] as { clientIds: string[] })?.clientIds.includes(clientId)) {
      onReactionDelete(message, { type: reactionType, name: emoji });
    } else {
      onReactionAdd(message, { type: reactionType, name: emoji });
    }
  };

  return (
    <div className={`flex flex-wrap gap-1 items-center ${className}`}>
      {sortedReactions.map(({ emoji, count, hasReacted }) => (
        <ReactionButton
          key={emoji}
          emoji={emoji}
          count={count}
          isActive={hasReacted}
          onClick={handleReactionClick}
        />
      ))}
      <EmojiPicker
        onEmojiSelect={(emoji) => onReactionAdd(message, { type: reactionType, name: emoji })}
      />
    </div>
  );
}
