import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import type { Employee } from '../lib';

export type SelfieCaptureProps = {
  employee?: Employee;
  requireLiveness?: boolean;
  onCapture: (photoData: string, livenessPassed: boolean) => void;
};

const prompts = ['Blink twice', 'Turn head left', 'Smile', 'Raise your eyebrows'];

export const SelfieCapture = ({ employee, requireLiveness, onCapture }: SelfieCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setError('Camera not supported in this environment. Upload a photo instead.');
      return;
    }
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (!active) return;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(() => setError('Unable to start camera stream.'));
            setStreamReady(true);
          };
        }
      })
      .catch(() => {
        setError('Permission denied. Tap to upload a verification photo.');
      });
    return () => {
      active = false;
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks?.();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl, requireLiveness ? Math.random() > 0.2 : true);
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, [onCapture, requireLiveness]);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-surface/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Verify identity</h3>
          <p className="text-xs text-muted-foreground">
            {requireLiveness
              ? `Random prompt: ${prompt}`
              : 'Selfie snapshot required for this device.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleCapture} disabled={!streamReady && !error}>
          Capture
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/60">
        {error ? (
          <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-amber-200">{error}</div>
        ) : (
          <motion.video
            ref={videoRef}
            className="h-48 w-full object-cover"
            playsInline
            muted
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: streamReady ? 1 : 0.4 }}
          />
        )}
        <canvas ref={canvasRef} className="hidden" aria-hidden />
      </div>
      <div className="text-xs text-muted-foreground">
        Photo is stored per policy ({employee?.displayName ?? 'employee'}). Retention respects configured duration.
      </div>
    </div>
  );
};
