import React, { useState, useRef, useEffect } from 'react';
import { VolumeX, CloudRain } from 'lucide-react';

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Light rain ambient noise
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play blocked", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 9999 }}>
      <button 
        onClick={togglePlay} 
        style={{
          width: '50px', height: '50px', borderRadius: '50%', 
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', cursor: 'pointer',
          color: isPlaying ? 'var(--accent-blue)' : 'var(--text-muted)',
          transition: 'all 0.3s'
        }}
        className="hover:border-zinc-500 hover:text-white"
        title="Toggle Ambient Rain"
      >
        {isPlaying ? <CloudRain size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  );
}
