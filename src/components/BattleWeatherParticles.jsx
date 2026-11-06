import React from 'react';
import './BattleWeatherParticles.css';

// Solo grafica: i turni e gli effetti di gioco rimangono gestiti dal battleSystem.
const particleCounts = { rainstorm: 58, snowstorm: 30, lush_grass: 28 };
const particles = Object.fromEntries(Object.entries(particleCounts).map(([type, count]) => [
  type,
  Array.from({ length: count }, (_, i) => {
    const seed = (n, mod) => (i * n + 17) % mod;
    const duration = type === 'rainstorm' ? 1.0 + seed(23, 90) / 100
      : type === 'snowstorm' ? 7 + seed(19, 85) / 10
      : 5.5 + seed(29, 85) / 10;
    return {
      '--particle-left': `${seed(41, 99)}%`,
      '--particle-duration': `${duration.toFixed(2)}s`,
      '--particle-delay': `${(-seed(31, 180) / 10).toFixed(1)}s`,
      '--particle-size': `${type === 'rainstorm' ? 1.6 + seed(7, 18) / 10 : 2 + seed(13, 58) / 10}px`,
      '--particle-alpha': `${(0.4 + seed(11, 45) / 100).toFixed(2)}`,
      '--particle-drift': `${seed(37, 130) - 65}px`
    };
  })
]));

export function BattleWeatherParticles({ weather, tailwind }) {
  const type = weather?.turns > 0 && particleCounts[weather.type] ? weather.type : null;
  const hasTailwind = Object.values(tailwind || {}).some(turns => turns > 0);
  if (!type && !hasTailwind) return null;

  return (
    <div className="battle-weather-visuals" aria-hidden="true">
      {type && <div className={`battle-weather-particles battle-weather-particles--${type}`}>
        {particles[type].map((style, index) => (
          <span key={`${type}-${index}`}
            className={`battle-weather-particle battle-weather-particle--${type}${type === 'lush_grass' && index % 4 === 0 ? ' battle-weather-particle--leaf' : ''}`}
            style={style} />
        ))}
      </div>}
      {hasTailwind && <div className="battle-tailwind-visuals">
        {Array.from({ length: 5 }, (_, i) =>
          <span key={i} style={{
            '--wind-y': `${15 + i * 17}%`,
            '--wind-delay': `${-i * 1.2}s`
          }} />
        )}
      </div>}
    </div>
  );
}
