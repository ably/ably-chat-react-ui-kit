import { clsx } from 'clsx';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Position options for tooltip placement
 */
type TooltipPosition = 'above' | 'below' | 'auto';

/**
 * Props for the Tooltip component
 */
export interface TooltipProps {
  /**
   * The content to display in the tooltip
   */
  title: React.ReactNode;

  /**
   * The trigger element that the tooltip will be positioned relative to
   */
  children: React.ReactElement;

  /**
   * Position of the tooltip relative to its trigger element
   * @default 'auto'
   */
  position?: TooltipPosition;

  /**
   * Whether the tooltip is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes to apply to the tooltip
   */
  className?: string;
}

/**
 * Mouse and focus event handler type
 */
type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void;

/**
 * Props that need to be forwarded to the child element
 */
interface ChildElementProps {
  onMouseEnter?: EventHandler;
  onMouseLeave?: EventHandler;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

/**
 * Type for React refs - compatible with React 19
 */
type ReactRef<T> = React.RefCallback<T> | React.RefObject<T> | null | undefined;

/**
 * Calculates tooltip position
 */
const calculatePosition = (
  triggerRect: { top: number; bottom: number; left: number; width: number },
  tooltipHeight: number,
  preferredPosition: TooltipPosition
): { position: Exclude<TooltipPosition, 'auto'>; top: number; left: number } => {
  const spacing = 8;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate available space
  const spaceAbove = triggerRect.top;
  const spaceBelow = viewportHeight - triggerRect.bottom;

  // Determine final position
  let finalPosition: Exclude<TooltipPosition, 'auto'>;
  if (preferredPosition === 'auto') {
    finalPosition =
      spaceBelow >= tooltipHeight + spacing || spaceBelow > spaceAbove ? 'below' : 'above';
  } else {
    // Use preferred position if there's space, otherwise fallback
    finalPosition =
      preferredPosition === 'above' && spaceAbove >= tooltipHeight + spacing ? 'above' : 'below';
  }

  // Calculate coordinates
  const top =
    finalPosition === 'above'
      ? triggerRect.top - tooltipHeight - spacing
      : triggerRect.bottom + spacing;

  let left = triggerRect.left + triggerRect.width / 2;

  // Ensure tooltip stays within viewport bounds
  const tooltipWidth = 200; // Approximate max width
  left = Math.max(
    spacing,
    Math.min(left - tooltipWidth / 2, viewportWidth - tooltipWidth - spacing)
  );

  return { position: finalPosition, top, left };
};

/**
 * Tooltip component renders a complete tooltip with content and customizable positioning
 *
 * Features:
 * - Automatic positioning above or below trigger element
 * - Responsive sizing with max-width constraints
 * - Optional arrow with perfect color matching
 *
 * This is an opinionated tooltip with sensible defaults:
 * - Only supports hover/focus triggers
 * - Simple above/below/auto positioning
 * - Fixed 200ms enter delay, no leave delay
 * - Always shows arrow
 * - Medium size only
 *
 * @example
 * <Tooltip title="Delete this item">
 *   <Button>Delete</Button>
 * </Tooltip>
 */
export const Tooltip = ({
  title,
  children,
  position = 'auto',
  disabled = false,
  className,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | undefined>();

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  // Position tooltip when it opens
  const updatePosition = useCallback(() => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();

    const result = calculatePosition(
      triggerRect || {
        top: 0,
        bottom: 0,
        left: 0,
        width: 0,
      },
      tooltipRect?.height || 40,
      position
    );
    setCoords({ top: result.top, left: result.left });
  }, [position]);

  const handleOpen = useCallback(() => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200); // delay to open tooltip
  }, [disabled]);

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  }, []);

  // Helper function to handle ref forwarding
  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      // Set our internal ref
      triggerRef.current = node;

      // Forward to original ref if it exists
      const childWithRef = children as React.ReactElement & { ref?: ReactRef<HTMLElement> };
      const originalRef = childWithRef.ref;

      if (originalRef) {
        if (typeof originalRef === 'function') {
          originalRef(node);
        } else if ('current' in originalRef) {
          (originalRef as React.RefObject<HTMLElement | null>).current = node;
        }
      }
    },
    [children]
  );

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isOpen) {
      // Wait a tick for the tooltip to render to measure size, then update position
      // Ensures coords get set so the portal content appears
      queueMicrotask(() => {
        updatePosition();
      });
    }
  }, [isOpen, updatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Early return AFTER all hooks
  if (!title || React.Children.count(children) !== 1) {
    return children;
  }

  const child = React.Children.only(children);
  const childProps = child.props as ChildElementProps;

  // Event handlers that preserve existing ones
  const handlers: ChildElementProps & { 'aria-describedby'?: string } = {
    onMouseEnter: (event) => {
      childProps.onMouseEnter?.(event);
      handleOpen();
    },
    onMouseLeave: (event) => {
      childProps.onMouseLeave?.(event);
      handleClose();
    },
    onFocus: (event) => {
      childProps.onFocus?.(event);
      handleOpen();
    },
    onBlur: (event) => {
      childProps.onBlur?.(event);
      handleClose();
    },
    'aria-describedby': isOpen ? tooltipId : undefined,
  };

  // Clone child with enhanced props and ref
  const cloneChild = React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
    ...handlers,
    ref: setRefs,
  });

  return (
    <>
      {cloneChild}
      {isOpen && createPortal(
          <TooltipContent
            ref={tooltipRef}
            id={tooltipId}
            coords={coords ?? { top: 0, left: 0 }}
            className={className}
          >
            {title}
          </TooltipContent>,
          document.body
      )}
    </>
  );
};

/**
 * Internal tooltip content component
 */
interface TooltipContentProps {
  id: string;
  coords: { top: number; left: number };
  className?: string;
  children: React.ReactNode;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ id, coords, className, children }, ref) => {
    const tooltipClasses = clsx(
      'ably-tooltip',
      'ably-tooltip--md', // Fixed medium size
      'ably-tooltip--wrap', // Fixed wrap behavior
      'ably-tooltip--max-w-xs', // Fixed max width
      className
    );

    const tooltipStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50, // Fixed z-index
      top: coords.top,
      left: coords.left,
    };

    return (
      <div ref={ref} id={id} className={tooltipClasses} style={tooltipStyle} role="tooltip">
        {children}
      </div>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';
