import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

function Capture() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const loadModels = async () => {
      const uri = "/models"; 
      await faceapi.nets.tinyFaceDetector.loadFromUri(uri);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(uri);
      startCamera();
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      detectFace();
    } catch (error) {
      setErrorMessage("Failed to access the camera.");
    }
  };


  const detectFace = () => {
    const video = videoRef.current;

    const faceDetectionInterval = setInterval(async () => {
      if (video && faceapi.nets.tinyFaceDetector.isLoaded) {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        
        setFaceDetected(detections.length > 0);
      }
    }, 500); 

  
    return () => clearInterval(faceDetectionInterval);
  };

  const capturePhoto = async () => {
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

  
    
   
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraOpen(false);

   
    navigate("/login", { state: { account: user } });
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
     <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[90%] sm:max-w-[720px] mx-auto p-4 sm:p-8 rounded-lg">
  <h1 className="text-xl sm:text-2xl font-semibold text-white text-center" style={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.6)" }}>
    Capture photo for authentication
         
        </h1>
        <div className="w-full text-right">
    <div className="mx-auto w-full max-w-xs sm:max-w-md">
            {isCameraOpen && (
              <div className="mt-3 flex flex-col items-center">
                <video ref={videoRef} className="w-full max-w-xs" />
                {}
                <button
                  onClick={capturePhoto}
                  disabled={!faceDetected}
                  className={`flex justify-center items-center w-full py-2.5 px-5 mr-2 text-sm font-medium text-white rounded-lg border border-gray-200 inline-flex items-center ${
                    faceDetected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 cursor-not-allowed"
                  } mt-6`} 
                >
                  {faceDetected ? "Capture Photo" : "No Face Detected"}
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
    </div>
  );
}

export default Capture;
