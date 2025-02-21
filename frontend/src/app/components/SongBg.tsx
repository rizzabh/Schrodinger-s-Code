import { useEffect, useRef } from "react";

const SongBg = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object
    audioRef.current = new Audio("/music.mp3"); // Ensure music.mp3 is in the public folder
    audioRef.current.loop = true; // Loop the song

    // Try playing automatically
    const playAudio = () => {
      audioRef.current?.play().catch((error) => {
        console.error("Autoplay failed:", error);
      });
    };

    // Attempt to play immediately
    playAudio();

    // Ensure audio plays on user interaction (for browsers blocking autoplay)
    const handleInteraction = () => {
      playAudio();
      document.removeEventListener("click", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);

    return () => {
      audioRef.current?.pause();
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  return null; // No visible UI
};

export default SongBg;