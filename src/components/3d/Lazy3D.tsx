import { Suspense, type ReactNode } from 'react';
import { use3DEnabled } from '../../hooks/useMedia';
import ErrorBoundary from '../ErrorBoundary';

interface Lazy3DProps {
  /** Shown on mobile, reduced-motion, no-WebGL devices, while the 3D chunk loads, or after an error. */
  fallback: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Shared gate for every 3D scene: mounts the scene only on capable desktops,
 * shows the fallback while the lazy chunk loads, and isolates runtime errors.
 */
export default function Lazy3D({ fallback, children, className = '' }: Lazy3DProps) {
  const enabled = use3DEnabled();
  if (!enabled) {
    return <div className={className}>{fallback}</div>;
  }
  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <div className="absolute inset-0">{children}</div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
