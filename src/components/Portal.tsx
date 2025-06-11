import { createPortal } from 'react-dom';
import { useEffect, useState, PropsWithChildren, FC } from 'react';

export interface PortalProps extends PropsWithChildren {
  /** Where to mount the portal. Defaults to document.body. */
  container?: HTMLElement | null;
}

/**
 * Low-level helper that renders children into `container`
 * (or `document.body` if no container is given).
 *
 * - Safe for SSR (returns null on first render).
 * - Consumers can pass their own `container` to integrate with
 *   an existing #modal-root, shadow DOM, micro-front-end, etc.
 */
export const Portal: FC<PortalProps> = ({ children, container }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Fall back to <body> once we’re on the client.
    setMountNode(container ?? document.body);
  }, [container]);

  return mountNode ? createPortal(children, mountNode) : null;
};
