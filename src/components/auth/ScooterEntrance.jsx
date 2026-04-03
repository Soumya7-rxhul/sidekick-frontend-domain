import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import ScooterLogo from './ScooterLogo';
import SpeedLines from './SpeedLines';
import { RideDust, IdlePuff } from './DustParticles';

// Phase states
const PHASE = { BLANK: 'blank', RIDING: 'riding', BRAKING: 'braking', SETTLED: 'settled' };

export default function ScooterEntrance({ onComplete, headlightBright, ridersLean }) {
  const [phase, setPhase] = useState(PHASE.BLANK);
  const [puff, setPuff] = useState(false);
  const controls = useAnimation();
  const puffTimer = useRef();

  useEffect(() => {
    const run = async () => {
      // Phase 1 — blank 0.3s
      await new Promise(r => setTimeout(r, 300));

      // Phase 1 — ride in from left
      setPhase(PHASE.RIDING);
      await controls.start({
        x: 0,
        transition: { duration: 1.5, ease: [0.1, 0.0, 0.3, 1.0] },
      });

      // Phase 2 — overshoot + spring back
      setPhase(PHASE.BRAKING);
      await controls.start({
        x: 30,
        transition: { duration: 0.25, ease: 'easeOut' },
      });
      await controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
      });

      // Phase 3 — settled
      setPhase(PHASE.SETTLED);
      onComplete?.();

      // Start idle puff every 4.5s
      puffTimer.current = setInterval(() => {
        setPuff(true);
        setTimeout(() => setPuff(false), 1400);
      }, 4500);
    };

    run();
    return () => clearInterval(puffTimer.current);
  }, []);

  const isRiding  = phase === PHASE.RIDING || phase === PHASE.BRAKING;
  const isSettled = phase === PHASE.SETTLED;

  return (
    <>
      <SpeedLines visible={isRiding} />

      <motion.div
        initial={{ x: '-110vw' }}
        animate={controls}
        style={{ position: 'relative', display: 'inline-block', willChange: isRiding ? 'transform' : 'auto' }}
      >
        {/* Idle float after settled */}
        <motion.div
          animate={isSettled ? { y: [0, -5, 0] } : { y: 0 }}
          transition={isSettled ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          {/* Skid marks — show briefly after brake */}
          <AnimatePresence>
            {phase === PHASE.BRAKING && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 0.5, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute', bottom: 14, left: 30,
                  width: 60, height: 3,
                  background: 'linear-gradient(to right, transparent, rgba(100,100,100,0.6))',
                  borderRadius: 2, transformOrigin: 'left',
                }}
              />
            )}
          </AnimatePresence>

          {/* Dust during ride */}
          <RideDust visible={isRiding} />

          {/* Idle exhaust puff */}
          {isSettled && <IdlePuff trigger={puff} />}

          <ScooterLogo
            scale={1}
            isRiding={isRiding}
            headlightBright={headlightBright}
            ridersLean={ridersLean}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
