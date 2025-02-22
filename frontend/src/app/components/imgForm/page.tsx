"use client"
import { useState } from "react";

const LocationCameraUploader = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const captureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const captureImage = async () => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));
    video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    stream.getTracks().forEach((track) => track.stop()); // Stop the video stream
    const capturedImage = canvas.toDataURL("image/png");
    setImage(capturedImage);
  };

  const uploadToCloudinary = async () => {
    if (!image) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "schrodinger");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dwl0u1dqd/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadedUrl(data.secure_url);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className=" flex  items-center gap-4">
      
      <div>
      <button onClick={captureImage} className="bg-gray-500 text-white px-4 py-2 rounded">
        Capture Image
      </button>
      {image && <img src={image} alt="Captured" className="w-64 h-64 object-cover mt-2" />}

      <button
        onClick={uploadToCloudinary}
        className="bg-purple-500 text-white px-4 py-2 mt-3 ml-2 rounded"
        disabled={!image || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      </div>

      {uploadedUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={uploadedUrl} alt="Uploaded" className="w-64 h-64 object-cover mt-2" />
          
        </div>
      )}
    </div>
  );
};

export default LocationCameraUploader;
