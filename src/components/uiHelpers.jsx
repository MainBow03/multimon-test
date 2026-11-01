// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const renderHealthBarImpl = (ctx, hp, maxHp) => {

              const percentage = (hp / maxHp) * 100;
              let color = 'bg-green-500'; if (percentage < 50) color = 'bg-yellow-400'; if (percentage < 20) color = 'bg-red-500';
              return (
                  <div className="w-full bg-gray-900 rounded-full h-4 mt-1 relative overflow-hidden border border-gray-950">
                      <div className={`${color} h-full transition-all duration-1000 ease-in-out`} style={{ width: `${percentage}%` }}></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10">
                              {Math.ceil(percentage)}%
                      </span>
                  </div>
              );
          
};
