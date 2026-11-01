const TYPE_STYLES = {
          'Normale': 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
          'Lotta': 'bg-gradient-to-r from-red-600 to-red-800 text-white',
          'Fuoco': 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
          'Acqua': 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
          'Erba': 'bg-gradient-to-r from-green-400 to-green-600 text-white',
          'Aria': 'bg-gradient-to-r from-teal-200 to-cyan-400 text-gray-900',
          'Roccia': 'bg-gradient-to-r from-stone-500 to-stone-700 text-white',
          'Ghiaccio': 'bg-gradient-to-r from-cyan-200 to-blue-300 text-gray-900',
          'Robot': 'bg-gradient-to-r from-slate-400 to-slate-600 text-white',
          'Drago': 'bg-gradient-to-r from-indigo-500 to-purple-700 text-white',
          'Magico': 'bg-gradient-to-r from-pink-400 to-purple-500 text-white',
          'Veleno': 'bg-gradient-to-r from-purple-500 to-fuchsia-700 text-white',
          'Insetto': 'bg-gradient-to-r from-lime-400 to-green-500 text-gray-900',
          'Elettro': 'bg-gradient-to-r from-yellow-300 to-amber-500 text-gray-900',
          'Oscuro': 'bg-gradient-to-r from-gray-800 to-gray-950 text-purple-300 border border-purple-900/50',
          'Spettro': 'bg-gradient-to-r from-violet-600 to-fuchsia-900 text-white shadow-[0_0_8px_rgba(139,92,246,0.6)] border border-violet-400',
          'Buio': 'bg-gradient-to-r from-slate-900 to-black text-cyan-200 border border-cyan-900/50 shadow-[0_0_8px_rgba(8,145,178,0.5)]',
          'Suono': 'bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-[0_0_8px_rgba(236,72,153,0.5)]',
          'Psico': 'bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white shadow-[0_0_8px_rgba(217,70,239,0.5)]',
          'Terra': 'bg-gradient-to-r from-yellow-700 to-yellow-900 text-white shadow-[0_0_8px_rgba(161,98,7,0.5)]',
          'Luce': 'bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-900 shadow-[0_0_10px_rgba(253,224,71,0.8)] border border-yellow-400',
          'Cristallo': 'bg-gradient-to-r from-sky-200 to-indigo-300 text-sky-900 shadow-[0_0_10px_rgba(125,211,252,0.8)] border border-sky-400'
        };

        const TYPE_CHART = {
          'Normale': { 'Roccia': 0.5, 'Robot': 0.5, 'Magico': 1, 'Spettro': 0, 'Cristallo': 2 },
          'Fuoco': { 'Erba': 2, 'Insetto': 2, 'Ghiaccio': 2, 'Robot': 2, 'Fuoco': 0.5, 'Acqua': 0.5, 'Roccia': 0.5, 'Drago': 0.5, 'Cristallo': 2 },
          'Acqua': { 'Fuoco': 2, 'Roccia': 2, 'Terra': 2, 'Acqua': 0.5, 'Erba': 0.5, 'Drago': 0.5 },
          'Erba': { 'Acqua': 2, 'Roccia': 2, 'Terra': 2, 'Fuoco': 0.5, 'Erba': 0.5, 'Veleno': 0.5, 'Aria': 0.5, 'Insetto': 0.5, 'Drago': 0.5, 'Robot': 0.5 },
          'Lotta': { 'Normale': 2, 'Roccia': 2, 'Ghiaccio': 2, 'Robot': 2, 'Oscuro': 2, 'Buio': 2, 'Aria': 0.5, 'Veleno': 0.5, 'Magico': 0.5, 'Insetto': 0.5, 'Spettro': 0, 'Psico': 0.5 },
          'Aria': { 'Erba': 2, 'Lotta': 2, 'Insetto': 2, 'Elettro': 0.5, 'Roccia': 0.5, 'Robot': 0.5 },
          'Roccia': { 'Fuoco': 2, 'Ghiaccio': 2, 'Aria': 2, 'Insetto': 2, 'Lotta': 0.5, 'Robot': 0.5, 'Terra': 0.5, 'Suono': 2, 'Cristallo': 2 },
          'Ghiaccio': { 'Erba': 2, 'Aria': 2, 'Drago': 2, 'Terra': 2, 'Fuoco': 0.5, 'Acqua': 0.5, 'Ghiaccio': 0.5, 'Robot': 0.5, 'Suono': 2, 'Luce': 2 },
          'Robot': { 'Roccia': 2, 'Ghiaccio': 2, 'Magico': 2, 'Robot': 0.5, 'Fuoco': 0.5, 'Acqua': 0.5, 'Elettro': 0.5 },
          'Drago': { 'Drago': 2, 'Robot': 0.5, 'Magico': 0 },
          'Magico': { 'Lotta': 2, 'Drago': 2, 'Buio': 2, 'Fuoco': 0.5, 'Veleno': 0.5, 'Robot': 0.5, 'Oscuro': 0.5, 'Spettro': 0.5, 'Cristallo': 0.5 },
          'Veleno': { 'Erba': 2, 'Magico': 2, 'Veleno': 0.5, 'Roccia': 0.5, 'Terra': 0.5, 'Robot': 0, 'Spettro': 0.5 },
          'Insetto': { 'Erba': 2, 'Magico': 0.5, 'Buio': 2, 'Lotta': 0.5, 'Aria': 0.5, 'Veleno': 0.5, 'Fuoco': 0.5, 'Robot': 0.5, 'Oscuro': 2, 'Spettro': 0.5, 'Psico': 2 },
          'Elettro': { 'Acqua': 2, 'Aria': 2, 'Erba': 0.5, 'Elettro': 0.5, 'Drago': 0.5, 'Roccia': 1, 'Terra': 0, 'Luce': 0.5, 'Cristallo': 0.5 },
          'Oscuro': { 'Magico': 2, 'Lotta': 0.5, 'Oscuro': 0.5, 'Spettro': 2, 'Psico': 2, 'Luce': 2 },
          'Spettro': { 'Spettro': 2, 'Magico': 2, 'Normale': 0, 'Oscuro': 0.5, 'Psico': 2, 'Luce': 0.5 },
          'Buio': { 'Magico': 2, 'Spettro': 2, 'Lotta': 0.5, 'Oscuro': 0.5, 'Buio': 0.5, 'Psico': 2 },
          'Suono': { 'Elettro': 2, 'Robot': 2, 'Roccia': 0.5, 'Ghiaccio': 0.5, 'Spettro': 0 },
          'Psico': { 'Lotta': 2, 'Veleno': 2, 'Psico': 0.5, 'Robot': 0.5, 'Oscuro': 0, 'Buio': 0, 'Cristallo': 0.5 },
          'Terra': { 'Fuoco': 2, 'Elettro': 2, 'Veleno': 2, 'Roccia': 2, 'Robot': 2, 'Erba': 0.5, 'Insetto': 0.5, 'Aria': 0, 'Luce': 2 },
          'Luce': { 'Oscuro': 2, 'Spettro': 2, 'Psico': 2, 'Fuoco': 0.5, 'Robot': 0.5, 'Magico': 0.5, 'Cristallo': 0.5 },
          'Cristallo': { 'Luce': 2, 'Magico': 2, 'Psico': 2, 'Elettro': 2, 'Normale': 0.5, 'Fuoco': 0.5, 'Roccia': 0.5 }
        };

        const PLAYER_THEMES = {
            p1: { bg: 'bg-blue-900/40', border: 'border-blue-500', text: 'text-blue-400', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
            p2: { bg: 'bg-red-900/40', border: 'border-red-500', text: 'text-red-400', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
            p3: { bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-400', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]' },
            p4: { bg: 'bg-yellow-900/40', border: 'border-yellow-500', text: 'text-yellow-400', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
            p5: { bg: 'bg-purple-900/40', border: 'border-purple-500', text: 'text-purple-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
            p6: { bg: 'bg-orange-900/40', border: 'border-orange-500', text: 'text-orange-400', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]' },
            p7: { bg: 'bg-cyan-900/40', border: 'border-cyan-500', text: 'text-cyan-400', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
            p8: { bg: 'bg-pink-900/40', border: 'border-pink-500', text: 'text-pink-400', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]' }
        };

        const getMultiplier = (attackType, defenderTypes) => {
          let mult = 1;
          if (!defenderTypes) return 1; // FIX: Previene crash se i tipi non sono definiti
          defenderTypes.forEach(defType => {
            if (TYPE_CHART[attackType] && TYPE_CHART[attackType][defType] !== undefined) {
              mult *= TYPE_CHART[attackType][defType];
            }
          });
          return mult;
        };

        const getDefaultAvatar = (name) => `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'Player'}`;

export { TYPE_STYLES, TYPE_CHART, PLAYER_THEMES, getMultiplier, getDefaultAvatar };
