import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { storage } from "../firebase";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import FacePicture from "../assets/images/facepicture.avif";

function Login() {
  const [localUserStream, setLocalUserStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loginResult, setLoginResult] = useState("PENDING");
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);

  const videoRef = useRef();
  const canvasRef = useRef();
  const faceApiIntervalRef = useRef();
  const videoWidth = 640;
  const videoHeight = 360;

  const navigate = useNavigate();

  const loadModels = async () => {
    const uri = "/models";
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri(uri);
      await faceapi.nets.faceLandmark68Net.loadFromUri(uri);
      await faceapi.nets.faceRecognitionNet.loadFromUri(uri);
      console.log("Models loaded successfully!");
    } catch (err) {
      console.error("Error loading models:", err);
    }
  };

  useEffect(() => {
    loadModels()
      .then(async () => {
        const descriptors = await loadLabeledImages();
        setLabeledFaceDescriptors(descriptors);
      })
      .then(() => setModelsLoaded(true))
      .catch((error) => {
        console.error("Error in initialization:", error);
      });
  }, []);

  const getLocalUserVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      videoRef.current.srcObject = stream;
      setLocalUserStream(stream);
    } catch (err) {
      setVideoError(true);
      console.error("Error accessing webcam:", err);
    }
  };

  const scanFace = async () => {
    if (!labeledFaceDescriptors) {
      console.error("No labeled face descriptors available");
      return;
    }

    faceapi.matchDimensions(canvasRef.current, videoRef.current);
    const faceApiInterval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, {
        width: videoWidth,
        height: videoHeight,
      });

      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
      const results = resizedDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );

      if (!canvasRef.current) {
        return;
      }

      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, videoWidth, videoHeight);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

      if (results.length > 0) {
        const match = results[0];
        console.log(`Detected match: ${match.label} with distance ${match.distance}`);

        if (match.distance < 0.6) {
          console.log("Face authenticated successfully!");
          setLoginResult("SUCCESS");
          clearInterval(faceApiIntervalRef.current);

          // Call handleSuccess to save account info and redirect
          handleSuccess(match.label);
        } else {
          console.log("No match found with sufficient confidence.");
          setLoginResult("FAILED");
        }
      } else {
        console.log("No faces matched.");
        setLoginResult("FAILED");
      }

      if (!faceApiLoaded) {
        setFaceApiLoaded(true);
      }
    }, 1000 / 15);
    faceApiIntervalRef.current = faceApiInterval;
  };

  const handleSuccess = (label) => {
    // Assuming the label is the filename or ID of the matched user
    const account = {
      type: "CUSTOM",  // Or any other type based on your data
      fullName: label,  // Replace with actual full name if available
      picture: `${label}.png`,  // Assuming the image filename corresponds to the label
    };

    // Store the account information in localStorage
    localStorage.setItem("faceAuth", JSON.stringify({ account }));

    // Clear up resources before redirecting
    videoRef.current.pause();
    videoRef.current.srcObject = null;

    if (localUserStream) {
      localUserStream.getTracks().forEach((track) => track.stop());
    }

    clearInterval(faceApiIntervalRef.current);
    // Redirect to protected page
    navigate("/protected", { replace: true });
  };

  async function loadLabeledImages() {
    const descriptors = [];
    try {
      const storageRef = ref(storage, "faces/");
      const listResult = await listAll(storageRef);

      console.log("Found images in Firebase:", listResult.items);

      const imagePromises = listResult.items.map(async (itemRef) => {
        const imgPath = await getDownloadURL(itemRef);
        const img = await faceapi.fetchImage(imgPath);

        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          descriptors.push(
            new faceapi.LabeledFaceDescriptors(itemRef.name, [
              detection.descriptor,
            ])
          );
          console.log(`Loaded face descriptor for ${itemRef.name}`);
        } else {
          console.error(`No face detected in image: ${itemRef.name}`);
        }
      });

      await Promise.all(imagePromises);

      if (descriptors.length > 0) {
        console.log("Successfully loaded labeled face descriptors");
      } else {
        console.error("No valid labeled face descriptors found.");
      }

      return descriptors;
    } catch (error) {
      console.error("Error loading images from Firebase:", error);
      return null;
    }
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col items-center justify-center gap-[24px] max-w-[720px] mx-auto">
        {!localUserStream && !modelsLoaded && (
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">You're Attempting to Log In With Your Face.</span>
            <span className="block text-white mt-2">Loading Models...</span>
          </h2>
        )}
        {!localUserStream && modelsLoaded && (
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block text-white mt-2">Please Authenticate Your Face to Log In.</span>
          </h2>
        )}
        {localUserStream && loginResult === "SUCCESS" && (
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block text-white mt-2">Face successfully authenticated. Redirecting...</span>
          </h2>
        )}
        {localUserStream && loginResult === "FAILED" && (
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-rose-700 sm:text-4xl">
            <span className="block mt-[56px]">Face not recognised</span>
          </h2>
        )}
        <div className="w-full">
          <div className="relative flex flex-col items-center p-[10px]">
            <video
              muted
              autoPlay
              ref={videoRef}
              height={videoHeight}
              width={videoWidth}
              onPlay={scanFace}
              style={{
                objectFit: "fill",
                height: "360px",
                borderRadius: "10px",
                display: localUserStream ? "block" : "none",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                display: localUserStream ? "block" : "none",
              }}
            />
          </div>
          {!localUserStream && (
            <>
              {modelsLoaded ? (
                <>
                  <img
                    alt="loading models"
                    src={FacePicture}
                    className="cursor-pointer my-8 mx-auto object-cover h-[272px]"
                  />
                  <button
                    onClick={getLocalUserVideo}
                    type="button"
                    className="flex justify-center items-center w-full py-2.5 px-5 mr-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg border border-gray-200"
                  >
                    Start Face Authentication
                  </button>
                </>
              ) : (
                <img
                  alt="loading models"
                  src={FacePicture}
                  className="cursor-pointer my-8 mx-auto object-cover h-[272px]"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
