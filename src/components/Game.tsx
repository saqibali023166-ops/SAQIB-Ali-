import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, CharacterId, GameSettings } from '../types';
import { VOICES } from '../constants';
import { Heart, Zap, Sword, MessageSquareQuote } from 'lucide-react';

const SETTINGS: GameSettings = {
  maxHealth: 100,
  gravity: 0.8,
  jumpForce: -15,
  speed: 5,
  attackRange: 80,
  damage: 5,
  specialDamage: 25,
};

const INITIAL_P1: Character = {
  id: 'salman',
  name: 'SALMAN',
  fullName: 'Salman Khan (Bhai)',
  tagline: 'Swaagat nahi karoge hamara?',
  color: '#3b82f6',
  health: 100,
  maxHealth: 100,
  x: 100,
  y: 0,
  width: 60,
  height: 120,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isAttacking: false,
  attackTimeout: null,
  direction: 'right',
  specialCharge: 0,
  isSpecialActive: false,
  specialTimeout: null,
  score: 0,
};

const INITIAL_P2: Character = {
  id: 'srk',
  name: 'SRK',
  fullName: 'Shah Rukh Khan (Badshah)',
  tagline: 'Picture abhi baaki hai mere dost!',
  color: '#ef4444',
  health: 100,
  maxHealth: 100,
  x: 800,
  y: 0,
  width: 60,
  height: 120,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isAttacking: false,
  attackTimeout: null,
  direction: 'left',
  specialCharge: 0,
  isSpecialActive: false,
  specialTimeout: null,
  score: 0,
};

interface GameProps {
  onGameOver: (winner: string) => void;
}

export default function Game({ onGameOver }: GameProps) {
  const [p1, setP1] = useState<Character>({ ...INITIAL_P1 });
  const [p2, setP2] = useState<Character>({ ...INITIAL_P2 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [flash, setFlash] = useState<boolean>(false);
  const [caption, setCaption] = useState<{ text: string, charId: CharacterId } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const requestRef = useRef<number>(0);

  const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
  const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const resetRound = () => {
    setP1(prev => ({ ...INITIAL_P1, score: prev.score }));
    setP2(prev => ({ ...INITIAL_P2, score: prev.score }));
  };

  const speak = (line: string, charId: CharacterId) => {
    setCaption({ text: line, charId });
    setTimeout(() => setCaption(prev => prev?.text === line ? null : prev), 3000);

    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = 'hi-IN'; // Hindi-India for the accents
    utterance.rate = 0.9;
    utterance.pitch = charId === 'salman' ? 0.8 : 1.1; // Salman deeper, SRK higher/dramatic
    window.speechSynthesis.cancel(); // Interrupt current speech
    window.speechSynthesis.speak(utterance);
  };

  const triggerVoice = (type: 'special' | 'knockdown' | 'win', charId: CharacterId) => {
    const lines = VOICES[charId][type];
    const line = lines[Math.floor(Math.random() * lines.length)];
    speak(line, charId);
  };

  const gameLoop = () => {
    if (isGameOver) return;

    const groundY = (containerRef.current?.clientHeight || 600) - 150;

    setP1(prevP1 => {
      setP2(prevP2 => {
        const nextP1 = { ...prevP1 };
        const nextP2 = { ...prevP2 };

        // --- P1 Movement ---
        if (keys.current['KeyA']) {
            nextP1.velocityX = -SETTINGS.speed;
            nextP1.direction = 'left';
        } else if (keys.current['KeyD']) {
            nextP1.velocityX = SETTINGS.speed;
            nextP1.direction = 'right';
        } else {
            nextP1.velocityX *= 0.8;
        }

        if (keys.current['KeyW'] && !nextP1.isJumping) {
            nextP1.velocityY = SETTINGS.jumpForce;
            nextP1.isJumping = true;
        }

        // --- P2 Movement ---
        if (keys.current['ArrowLeft']) {
            nextP2.velocityX = -SETTINGS.speed;
            nextP2.direction = 'left';
        } else if (keys.current['ArrowRight']) {
            nextP2.velocityX = SETTINGS.speed;
            nextP2.direction = 'right';
        } else {
            nextP2.velocityX *= 0.8;
        }

        if (keys.current['ArrowUp'] && !nextP2.isJumping) {
            nextP2.velocityY = SETTINGS.jumpForce;
            nextP2.isJumping = true;
        }

        // Apply Physics
        nextP1.velocityY += SETTINGS.gravity;
        nextP1.x += nextP1.velocityX;
        nextP1.y += nextP1.velocityY;

        nextP2.velocityY += SETTINGS.gravity;
        nextP2.x += nextP2.velocityX;
        nextP2.y += nextP2.velocityY;

        // Ground Collision
        if (nextP1.y >= groundY - nextP1.height) {
            nextP1.y = groundY - nextP1.height;
            nextP1.velocityY = 0;
            nextP1.isJumping = false;
        }
        if (nextP2.y >= groundY - nextP2.height) {
            nextP2.y = groundY - nextP2.height;
            nextP2.velocityY = 0;
            nextP2.isJumping = false;
        }

        // Boundary Collision
        const width = containerRef.current?.clientWidth || 1000;
        nextP1.x = Math.max(0, Math.min(width - nextP1.width, nextP1.x));
        nextP2.x = Math.max(0, Math.min(width - nextP2.width, nextP2.x));

        // --- Combat P1 ---
        if (keys.current['KeyF'] && !nextP1.isAttacking) {
            nextP1.isAttacking = true;
            nextP1.specialCharge = Math.min(100, nextP1.specialCharge + 2);
            
            // Check collision with P2
            const distance = Math.abs((nextP1.x + nextP1.width/2) - (nextP2.x + nextP2.width/2));
            if (distance < SETTINGS.attackRange && Math.abs(nextP1.y - nextP2.y) < 50) {
                nextP2.health -= SETTINGS.damage;
                setFlash(true);
                setTimeout(() => setFlash(false), 50);
            }

            setTimeout(() => {
                setP1(p => ({ ...p, isAttacking: false }));
            }, 200);
        }

        if (keys.current['KeyG'] && nextP1.specialCharge >= 100 && !nextP1.isSpecialActive) {
            nextP1.isSpecialActive = true;
            nextP1.specialCharge = 0;
            triggerVoice('special', 'salman');
            const distance = Math.abs((nextP1.x + nextP1.width/2) - (nextP2.x + nextP2.width/2));
            if (distance < SETTINGS.attackRange * 1.5) {
                nextP2.health -= SETTINGS.specialDamage;
                setFlash(true);
                setTimeout(() => setFlash(false), 200);
            }
            setTimeout(() => {
                setP1(p => ({ ...p, isSpecialActive: false }));
            }, 800);
        }

        // --- Combat P2 ---
        if (keys.current['KeyK'] && !nextP2.isAttacking) {
            nextP2.isAttacking = true;
            nextP2.specialCharge = Math.min(100, nextP2.specialCharge + 2);
            
            const distance = Math.abs((nextP2.x + nextP2.width/2) - (nextP1.x + nextP1.width/2));
            if (distance < SETTINGS.attackRange && Math.abs(nextP1.y - nextP2.y) < 50) {
                nextP1.health -= SETTINGS.damage;
                setFlash(true);
                setTimeout(() => setFlash(false), 50);
            }

            setTimeout(() => {
                setP2(p => ({ ...p, isAttacking: false }));
            }, 200);
        }

        if (keys.current['KeyL'] && nextP2.specialCharge >= 100 && !nextP2.isSpecialActive) {
            nextP2.isSpecialActive = true;
            nextP2.specialCharge = 0;
            triggerVoice('special', 'srk');
            const distance = Math.abs((nextP1.x + nextP1.width/2) - (nextP2.x + nextP2.width/2));
            if (distance < SETTINGS.attackRange * 1.5) {
                nextP1.health -= SETTINGS.specialDamage;
                setFlash(true);
                setTimeout(() => setFlash(false), 200);
            }
            setTimeout(() => {
                setP2(p => ({ ...p, isSpecialActive: false }));
            }, 800);
        }

        // Round Over Check
        if (nextP1.health <= 0 || nextP2.health <= 0) {
          if (nextP1.health <= 0) {
            triggerVoice('knockdown', 'salman');
            nextP2.score += 1;
            if (nextP2.score >= 3) {
              setWinnerName(nextP2.fullName);
              triggerVoice('win', 'srk');
              setIsGameOver(true);
            } else {
              resetRound();
              return nextP2; 
            }
          } else {
            triggerVoice('knockdown', 'srk');
            nextP1.score += 1;
            if (nextP1.score >= 3) {
              setWinnerName(nextP1.fullName);
              triggerVoice('win', 'salman');
              setIsGameOver(true);
            } else {
              resetRound();
              return nextP1;
            }
          }
        }

        setP1(nextP1);
        return nextP2;
      });
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen w-full bg-[#1a1a1a] overflow-hidden transition-colors duration-100 ${flash ? 'bg-zinc-800' : ''}`}
    >
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50">
        {/* P1 HUD */}
        <div className="w-1/3 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-blue-400 text-2xl uppercase">{p1.name}</span>
            <div className="flex gap-1 ml-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border border-blue-500/50 ${i < p1.score ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
          <div className="h-4 w-full bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              animate={{ width: `${p1.health}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="h-2 w-1/2 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-yellow-500"
              animate={{ width: `${p1.specialCharge}%` }}
            />
          </div>
        </div>

        {/* Timer/Versus UI */}
        <div className="flex flex-col items-center">
            <div className="text-4xl font-display text-zinc-600 italic">VS</div>
        </div>

        {/* P2 HUD */}
        <div className="w-1/3 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1 mr-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border border-red-500/50 ${i < p2.score ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-transparent'}`} />
              ))}
            </div>
            <span className="font-display text-red-400 text-2xl uppercase text-right">{p2.name}</span>
          </div>
          <div className="h-4 w-full bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-l from-red-600 to-red-400"
              animate={{ width: `${p2.health}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="h-2 w-1/2 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-yellow-500"
              animate={{ width: `${p2.specialCharge}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage Backdrop Elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vh] font-display text-white select-none">
          STREET FIGHT
        </div>
      </div>

      {/* Arena Floor */}
      <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-b from-zinc-800 to-zinc-950 border-t-4 border-zinc-700 shadow-2xl z-20">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_white,_transparent)]" />
      </div>

      {/* Players */}
      <Player character={p1} isOpponent={false} />
      <Player character={p2} isOpponent={true} />

      {/* Voice Captions Overlay */}
      <AnimatePresence>
        {caption && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute bottom-40 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border-2 backdrop-blur-md flex items-center gap-4 bg-black/80 ${
              caption.charId === 'salman' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            <MessageSquareQuote className={caption.charId === 'salman' ? 'text-blue-400' : 'text-red-400'} size={32} />
            <div className="flex flex-col">
              <span className={`text-[10px] font-display uppercase ${caption.charId === 'salman' ? 'text-blue-400' : 'text-red-400'}`}>
                {caption.charId === 'salman' ? 'Salman' : 'SRK'}
              </span>
              <p className="text-xl font-special text-white tracking-wide">{caption.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md"
            >
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                <h2 className="text-4xl font-display text-white mb-2">WINNER</h2>
                <h3 className="text-6xl font-display text-yellow-500 mb-6 drop-shadow-lg">{winnerName.split(' ')[0]}</h3>
                <p className="font-special text-zinc-400 italic mb-8">"Swag se karenge sabka swagat!"</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-white text-black font-display text-xl rounded-full hover:bg-zinc-200 transition-colors"
                >
                  REMATCH
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Player({ character, isOpponent }: { character: Character; isOpponent: boolean }) {
  return (
    <motion.div
      className="absolute z-30"
      animate={{ 
        x: character.x, 
        y: character.y,
        scaleX: character.direction === 'left' ? -1 : 1
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
    >
      <div className="relative" style={{ width: character.width, height: character.height }}>
        {/* Character Box */}
        <motion.div 
          className="absolute inset-0 border-2 rounded-xl flex items-center justify-center bg-zinc-900/80 shadow-2xl overflow-hidden"
          style={{ borderColor: character.color }}
          animate={{
            scaleX: character.isAttacking ? 1.2 : 1,
            rotate: character.isJumping ? (character.direction === 'right' ? 10 : -10) : 0,
            y: character.isAttacking ? -10 : 0
          }}
        >
          {/* Mock Character Sprite */}
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full mb-2 bg-gradient-to-b from-zinc-200 to-zinc-400 border-2`} style={{ borderColor: character.color }} />
            <div className="w-10 h-16 bg-zinc-700 rounded-md" />
          </div>

          {/* Special Effects */}
          {character.isSpecialActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0.5, 1, 0], scale: [0.5, 2, 2.5] }}
              className="absolute inset-0 bg-yellow-400/30 rounded-full"
            />
          )}
        </motion.div>

        {/* Health / Info Indicator (floating above) */}
        {!character.isSpecialActive && !character.isAttacking && (
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 px-3 py-1 rounded text-[10px] font-bold tracking-tighter"
           >
             {character.fullName.split(' ')[0]}
           </motion.div>
        )}

        {/* Attack Visual */}
        <AnimatePresence>
          {character.isAttacking && (
            <motion.div
                initial={{ opacity: 0, x: character.direction === 'right' ? 20 : -20 }}
                animate={{ opacity: 1, x: character.direction === 'right' ? 60 : -60 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/4"
            >
                <div className="flex items-center gap-1">
                    <Sword 
                        className={`w-8 h-8 ${isOpponent ? 'text-red-400' : 'text-blue-400'} drop-shadow-[0_0_8px_currentColor]`} 
                        style={{ transform: character.direction === 'left' ? 'scaleX(-1)' : '' }}
                    />
                    <motion.span 
                        animate={{ scale: [1, 1.5, 1] }} 
                        className="font-display text-white text-xs"
                    >
                        PUNCH!
                    </motion.span>
                </div>
            </motion.div>
          )}
          {character.isSpecialActive && (
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 2 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-8 pointer-events-none"
            >
                <div className="w-full h-full border-4 border-yellow-400/50 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-yellow-500 text-[10px] bg-black/80 px-2 rounded">
                    ULTIMATE!
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
