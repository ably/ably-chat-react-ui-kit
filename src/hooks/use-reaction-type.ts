import { useContext } from 'react';
import { ReactionTypeContext } from '../providers/ReactionTypeProvider/reactionTypeProvider';

export function useReactionType() {
  return useContext(ReactionTypeContext);
}
