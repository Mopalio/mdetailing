'use client';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { mountWasher, type WasherHandle } from './washer';

export interface WashPanelHandle {
  reset: () => void;
}

interface WashPanelProps {
  imageUrl: string;
  alt: string;
  /** 0..100, fired as the car gets cleaner */
  onProgress?: (percent: number) => void;
  /** what the hint under the cursor tells you to do */
  hint?: string;
  className?: string;
  ref?: React.Ref<WashPanelHandle>;
}

export function WashPanel({
  imageUrl,
  alt,
  onProgress,
  hint = 'Hold to blast',
  className,
  ref,
}: WashPanelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const sudsRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const washerRef = useRef<WasherHandle | null>(null);

  /* the engine is imperative, so the callback is held in a ref and
     the effect stays keyed on nothing: remounting it would repaint
     the grime and throw away the user's progress */
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!frame || !image || !canvas) return;

    const washer = mountWasher(
      {
        frame,
        image,
        canvas,
        shine: shineRef.current,
        suds: sudsRef.current,
        tool: toolRef.current,
        hint: hintRef.current,
        done: doneRef.current,
      },
      {
        onProgress: (p) => progressRef.current?.(p),
      }
    );

    washerRef.current = washer;
    setReady(true);

    return () => {
      washer.destroy();
      washerRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => washerRef.current?.reset(),
  }), []);

  return (
    <div className={['wash-panel', className].filter(Boolean).join(' ')}>
      <div className="wash-panel__frame" ref={frameRef}>
        <Image
          ref={imageRef}
          className="wash-panel__clean"
          src={imageUrl}
          alt={alt}
          fill
          priority
          sizes="100vw"
        />
        <canvas
          className="wash-panel__dirt"
          ref={canvasRef}
          aria-label={alt + '. Hold and aim to pressure wash it clean.'}
          role="img"
        />
        <div className="wash-panel__shine" ref={shineRef} />
        <div className="wash-panel__suds" ref={sudsRef} />
        <div className="wash-panel__tool" ref={toolRef} />
        <div className="wash-panel__hint" ref={hintRef} aria-hidden="true">
          <span className="hint-lance" />
          <b>{ready ? hint : ''}</b>
        </div>
        <div className="wash-panel__done" ref={doneRef} aria-hidden="true">
          <span className="stamp">Spotless</span>
        </div>
      </div>
    </div>
  );
}
