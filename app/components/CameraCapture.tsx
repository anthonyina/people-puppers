'use client';

import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onImageCapture: (imageDataUrl: string) => void;
}

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      setError(null);
      setIsStartingCamera(true);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      console.log('Camera stream obtained:', stream);

      if (videoRef.current) {
        console.log('Setting video source...');
        const video = videoRef.current;
        video.srcObject = stream;

        // Force video to play and show UI
        const showCameraUI = () => {
          console.log('Showing camera UI');
          setIsStreamActive(true);
          setIsStartingCamera(false);
        };

        // Wait for the video to be ready before showing UI
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          video.play().then(() => {
            console.log('Video started playing successfully');
            showCameraUI();
          }).catch(err => {
            console.error('Video play failed:', err);
            showCameraUI(); // Show UI anyway
          });
        };

        // Also listen for when video starts playing
        video.onplay = () => {
          console.log('Video play event fired');
          showCameraUI();
        };

        // Fallback in case events don't fire
        setTimeout(() => {
          console.log('Fallback timeout - showing camera UI');
          showCameraUI();
        }, 2000);
      } else {
        console.error('Video ref is null');
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(`Unable to access camera: ${err.message}. Please check permissions or try uploading a photo instead.`);
      setIsStartingCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip the image horizontally to match the mirrored preview
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.scale(-1, 1); // Reset transform

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    onImageCapture(imageDataUrl);
  }, [onImageCapture, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      onImageCapture(imageDataUrl);
    };
    reader.readAsDataURL(file);
  }, [onImageCapture]);


  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="text-center space-y-6">
        <div className="relative rounded-xl overflow-hidden bg-black min-h-[300px] flex items-center justify-center">
          {/* Always render video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`max-w-full max-h-96 object-contain ${isStreamActive ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
            onLoadedData={() => console.log('Video data loaded and ready to play')}
            onError={(e) => console.error('Video error:', e)}
          />

          {/* Show placeholder when camera not active */}
          {!isStreamActive && (
            <div className="text-center">
              {isStartingCamera ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-blue-100">Starting camera...</p>
                </>
              ) : (
                <>
                  <span className="text-6xl text-gray-400">📷</span>
                  <p className="text-gray-300 mt-2">Camera preview will appear here</p>
                </>
              )}
            </div>
          )}
        </div>

        {isStreamActive ? (
          // Camera controls
          <div className="flex gap-4 justify-center">
            <button
              onClick={capturePhoto}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-xl">📸</span>
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          // Start camera controls
          <div className="space-y-4">
            <button
              onClick={startCamera}
              disabled={isStartingCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">📸</span>
              {isStartingCamera ? 'Starting Camera...' : 'Start Camera'}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <label className="block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📁</span>
                Upload Photo
              </button>
            </label>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}