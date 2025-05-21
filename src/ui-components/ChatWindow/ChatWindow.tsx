import React, { useEffect, useRef, useState } from 'react';
import { useChatClient, useMessages } from '@ably/chat/react';
import { Message, MessageEvent, MessageEvents, PaginatedResult } from '@ably/chat';
import { ErrorInfo } from 'ably';
import { MessageBubble, MessageReactions, TextInputWithButton, TypingIndicator } from '../../atoms';
import { useTyping } from '@ably/chat/react';
import { useReactionType } from '../../hooks';
import { FaPencil, FaTrash } from 'react-icons/fa6';

interface ChatWindowProps {
  className?: string;
  height?: string;
  showTypingIndicator?: boolean;
}

export function ChatWindow({
  className = '',
  height = '100%',
  showTypingIndicator = true,
}: ChatWindowProps) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatClient = useChatClient();
  const clientId = chatClient.clientId;
  const { currentlyTyping, keystroke, stop } = useTyping();
  const { type: reactionType } = useReactionType();

  // Filter out the current user from the list of typing users
  const otherTypingUsers = Array.from(currentlyTyping).filter((client) => client !== clientId);

  const { getPreviousMessages, deleteMessage, update, send, addReaction, deleteReaction } =
    useMessages({
      listener: (event: MessageEvent) => {
        const message = event.message;
        switch (event.type) {
          case MessageEvents.Created: {
            setMessages((prevMessages) => {
              // if already exists do nothing
              const index = prevMessages.findIndex((other) => message.isSameAs(other));
              if (index !== -1) {
                return prevMessages;
              }

              // if the message is not in the list, make a new list that contains it
              const newArray = [...prevMessages, message];

              // and put it at the right place
              newArray.sort((a, b) => (a.before(b) ? -1 : 1));

              return newArray;
            });
            break;
          }
          case MessageEvents.Updated:
          case MessageEvents.Deleted: {
            setMessages((prevMessages) => {
              const index = prevMessages.findIndex((other) => message.isSameAs(other));
              if (index === -1) {
                return prevMessages;
              }

              const newMessage = prevMessages[index].with(event);

              // if no change, do nothing
              if (newMessage === prevMessages[index]) {
                return prevMessages;
              }

              // copy array and replace the message
              const updatedArray = prevMessages.slice();
              updatedArray[index] = newMessage;
              return updatedArray;
            });
            break;
          }
          default: {
            console.error('Unknown message', message);
          }
        }
      },
      reactionsListener: (reaction) => {
        const messageSerial = reaction.summary.messageSerial;
        setMessages((prevMessages) => {
          const index = prevMessages.findIndex((m) => m.serial === messageSerial);
          if (index === -1) {
            return prevMessages;
          }

          const newMessage = prevMessages[index].with(reaction);

          // if no change, do nothing
          if (newMessage === prevMessages[index]) {
            return prevMessages;
          }

          // copy array and replace the message
          const updatedArray = prevMessages.slice();
          updatedArray[index] = newMessage;
          return updatedArray;
        });
      },
      onDiscontinuity: (discontinuity) => {
        console.warn('Discontinuity', discontinuity);
        // reset the messages when a discontinuity is detected,
        // this will trigger a re-fetch of the messages
        setMessages([]);

        // set our state to loading, because we'll need to fetch previous messages again
        setLoading(true);

        // Do a message backfill
        backfillPreviousMessages(getPreviousMessages);
      },
    });

  const backfillPreviousMessages = (
    getPreviousMessages: ReturnType<typeof useMessages>['getPreviousMessages']
  ) => {
    if (getPreviousMessages) {
      getPreviousMessages({ limit: 50 })
        .then((result: PaginatedResult<Message>) => {
          setMessages(result.items.reverse());
          setLoading(false);
        })
        .catch((error: ErrorInfo) => {
          console.error(`Failed to backfill previous messages: ${error.toString()}`, error);
        });
    }
  };

  const handleMessageUpdate = (message: Message) => {
    const newText = prompt('Enter new text');
    if (!newText) {
      return;
    }
    update(
      message.copy({
        text: newText,
        metadata: message.metadata,
        headers: message.headers,
      })
    )
      .then((updatedMessage: Message) => {
        handleRESTMessageUpdate(updatedMessage);
      })
      .catch((error: unknown) => {
        console.warn('Failed to update message', error);
      });
  };

  const handleRESTMessageUpdate = (updatedMessage: Message) => {
    setMessages((prevMessages) => {
      const index = prevMessages.findIndex((m) => m.serial === updatedMessage.serial);
      if (index === -1) {
        return prevMessages;
      }
      if (updatedMessage.version <= prevMessages[index].version) {
        return prevMessages;
      }
      const updatedArray = prevMessages.slice();
      updatedArray[index] = updatedMessage;
      return updatedArray;
    });
  };

  const handleMessageDelete = (message: Message) => {
    deleteMessage(message, { description: 'deleted by user' }).then((deletedMessage: Message) => {
      handleRESTMessageUpdate(deletedMessage);
    });
  };

  // Used to anchor the scroll to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    backfillPreviousMessages(getPreviousMessages);
  }, [getPreviousMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSendMessage = (text: string) => {
    send({ text }).catch((error: unknown) => {
      console.error('Failed to send message', error);
    });

    // stop typing indicators
    stop().catch((error: unknown) => {
      console.error('Failed to stop typing indicator', error);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Typing indicators start method should be called with every keystroke
    if (e.target.value && e.target.value.length > 0) {
      keystroke().catch((error: unknown) => {
        console.error('Failed to start typing indicator', error);
      });
    } else {
      // For good UX we should stop typing indicators as soon as the input field is empty
      stop().catch((error: unknown) => {
        console.error('Failed to stop typing indicator', error);
      });
    }
  };

  return (
    <div
      className={`chat-window flex flex-col max-h-full overflow-hidden ${className}`}
      style={{ height }}
    >
      {loading && (
        <div
          className="flex-1 p-4 min-h-[calc(100%-100px)] flex items-center justify-center"
          style={{ minHeight: 'calc(100% - 120px)' }}
        >
          loading...
        </div>
      )}
      {!loading && (
        <>
          <div
            className="chat-message-container flex-grow overflow-y-auto h-full"
            style={{ minHeight: 'calc(100% - 120px)' }}
          >
            {messages.length === 0 ? (
              <div
                className="h-full flex items-center justify-center text-gray-500"
                style={{ minHeight: 'calc(100% - 120px)' }}
              >
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.serial} className="chat-message">
                  <div
                    className={
                      msg.clientId === clientId
                        ? 'chat-message-wrapper-self'
                        : 'chat-message-wrapper-other'
                    }
                  >
                    <div
                      className={
                        msg.clientId === clientId
                          ? 'chat-message-content-self'
                          : 'chat-message-content-other'
                      }
                    >
                      <div className="chat-message-meta">
                        <span>{msg.clientId}</span> &middot;{' '}
                        <span className="chat-message-time">
                          <span className="time-short">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="time-full">{msg.createdAt.toLocaleString()}</span>
                        </span>
                        {msg.isUpdated && msg.updatedAt ? (
                          <>
                            {' '}
                            &middot; Edited{' '}
                            <span className="chat-message-time">
                              <span className="time-short">
                                {new Date(msg.updatedAt).toLocaleTimeString()}
                              </span>
                              <span className="time-full">{msg.updatedAt.toLocaleString()}</span>
                            </span>
                            {msg.updatedBy ? <span> by {msg.updatedBy}</span> : ''}
                          </>
                        ) : (
                          ''
                        )}
                      </div>
                      <MessageBubble
                        text={msg.text}
                        isDeleted={msg.isDeleted}
                        isSelf={msg.clientId === clientId}
                        className="max-h-[200px] overflow-y-auto"
                      />
                      <div className="chat-message-buttons">
                        <FaPencil
                          className="icon-edit"
                          onClick={() => handleMessageUpdate(msg)}
                          aria-label="Edit message"
                        />
                        <FaTrash
                          className="icon-delete"
                          onClick={() => handleMessageDelete(msg)}
                          aria-label="Delete message"
                        />
                        <MessageReactions
                          message={msg}
                          clientId={clientId}
                          reactionType={reactionType}
                          onReactionAdd={addReaction}
                          onReactionDelete={deleteReaction}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="chat-input-area mt-auto flex-shrink-0"
            style={{ minHeight: '120px', maxHeight: '120px' }}
          >
            {showTypingIndicator && (
              <div className="chat-typing-indicator">
                <TypingIndicator
                  currentTypers={otherTypingUsers}
                  className="text-sm overflow-hidden"
                />
              </div>
            )}
            <div className="chat-input-wrapper">
              <TextInputWithButton
                onSubmit={handleSendMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                buttonText="Send"
                autoFocus
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
