interface SoundWaveProps {
  isPlaying: boolean;
  className?: string;
}

export default function SoundWave({
  isPlaying,
  className = "",
}: SoundWaveProps) {
  return (
    <div className={`flex items-center gap-1 h-4 ${className}`}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-[3px] bg-current rounded-full transition-all ${
            isPlaying ? "animate-sound-wave" : "h-1"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isPlaying ? undefined : "4px",
          }}
        />
      ))}
    </div>
  );
}
