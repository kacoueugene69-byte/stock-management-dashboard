import React from 'react';
import Logo from './Logo';

const LoadingSpinner: React.FC = () => {
  const dotCount = 14;
  const radius = 60; // pixels
  const animationDuration = 1.4; // seconds

  const dots = Array.from({ length: dotCount }).map((_, i) => {
    const angle = (i / dotCount) * 360;
    const style = {
      // Position dots in a circle
      transform: `rotate(${angle}deg) translate(${radius}px)`,
      // Animate each dot with a delay
      animation: `dot-pulse ${animationDuration}s infinite`,
      animationDelay: `${i * (animationDuration / dotCount)}s`,
    };
    return <div key={i} className="dot" style={style}></div>;
  });

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90">
      <div className="relative" style={{ width: `${radius * 2.2}px`, height: `${radius * 2.2}px` }}>
        {dots}
        <div className="absolute inset-0 flex flex-col items-center justify-center transform scale-75">
           <Logo variant="dark-on-light" size="sm" iconOnly />
           <p className="mt-2 text-sm font-medium text-blue-950 animate-pulse">Chargement...</p>
        </div>
      </div>
      <style>{`
        .dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          margin-top: -7px;
          margin-left: -7px;
          border-radius: 50%;
          background-color: #d1d5db; /* gray-300 */
        }

        @keyframes dot-pulse {
          0%, 100% {
            background-color: #d1d5db; /* gray-300 */
          }
          5% { /* Small window for the active state */
            background-color: #111827; /* gray-900 */
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;