
'use client';

import { useEffect, useState, useRef } from 'react';

interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
}

const NumberTicker = ({
  value,
  direction = 'up',
  delay = 0,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
  prefix = '',
  suffix = '',
  className,
  ...props
}: NumberTickerProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTimeout(() => {
            let start = 0;
            const end = value;
            const duration = 1500;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              if (elapsedTime > duration) {
                setDisplayValue(end);
                return;
              }
              const progress = (elapsedTime / duration);
              const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              
              const currentValue = start + (end - start) * easedProgress;
              setDisplayValue(currentValue);

              requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [value, delay]);

  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: (displayValue % 1 === 0) ? 0 : minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  }).format(displayValue);
  
  return (
    <span ref={ref} className={className} {...props}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default NumberTicker;
