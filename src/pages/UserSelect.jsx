import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserSelect() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Start the camera automatically when the component mounts
  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      setErrorMessage("Failed to access the camera.");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/png");

    const user = {
      id: "custom",
      fullName: "Custom User",
      type: "CUSTOM",
      picture: base64,
    };

    // Stop the video stream after capturing
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraOpen(false);

    // Navigate to the login page with the captured user data
    navigate("/login", { state: { account: user } });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-[24px] w-full max-w-[720px] mx-auto">
      <h1 className="text-2xl font-semibold">Capture photo for authentication</h1>
      <div className="w-full p-4 text-right">
        <div className="mx-auto w-full max-w-md">
          {isCameraOpen && (
            <div className="mt-3 flex flex-col items-center">
              <video ref={videoRef} className="w-full max-w-xs" />
              <button
                onClick={capturePhoto}
                className="flex justify-center items-center w-full py-2.5 px-5 mr-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg border border-gray-200 inline-flex items-center"
              >
                
                Capture Photo
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
          {errorMessage && (
            <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
