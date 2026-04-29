import { motion } from 'motion/react';
import { Play, Trophy, Users } from 'lucide-react';

interface LobbyProps {
  onStart: () => void;
}

export default function Lobby({ onStart }: LobbyProps) {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center px-4"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-600 mb-2 drop-shadow-[0_5px_15px_rgba(234,179,8,0.3)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          BOLLYWOOD BRAWLERS
        </motion.h1>
        <p className="font-special text-xl text-zinc-400 mb-12 tracking-[0.2em]">SALMAN VS SHAH RUKH</p>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex flex-col items-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <span className="text-3xl font-display text-blue-400">SAL</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Bhai-Giri</h3>
            <p className="text-xs text-zinc-500">Power: High | Speed: Med</p>
          </div>

          <div className="flex items-center justify-center text-4xl font-display text-zinc-700 italic">VS</div>

          <div className="flex flex-col items-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <span className="text-3xl font-display text-red-400">SRK</span>
            </div>
            <h3 className="text-xl font-bold mb-1">King Khan</h3>
            <p className="text-xs text-zinc-500">Power: Med | Speed: High</p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative px-12 py-4 bg-orange-600 hover:bg-orange-500 text-white font-display text-2xl rounded-full transition-all shadow-[0_10px_30px_rgba(234,88,12,0.4)] flex items-center gap-3 mx-auto"
          >
            <Play className="fill-current w-6 h-6 group-hover:rotate-12 transition-transform" />
            START FIGHT
          </motion.button>
          
          <div className="flex justify-center gap-8 text-zinc-500 text-sm mt-8">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>2 Players (Local)</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Win 3 Rounds</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Hints */}
      <div className="absolute bottom-8 left-8 text-zinc-500 font-mono text-[10px] space-y-1 bg-black/40 p-3 rounded border border-zinc-800">
        <p className="text-blue-400 font-bold mb-1 uppercase tracking-wider">SALMAN (P1)</p>
        <p>AWSD: Move</p>
        <p>F: Punch | G: Special</p>
      </div>

      <div className="absolute bottom-8 right-8 text-zinc-500 font-mono text-[10px] space-y-1 bg-black/40 p-3 rounded border border-zinc-800 text-right">
        <p className="text-red-400 font-bold mb-1 uppercase tracking-wider">SRK (P2)</p>
        <p>ARROWS: Move</p>
        <p>K: Punch | L: Special</p>
      </div>
    </div>
  );
}
