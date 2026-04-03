// src/hooks/useScrollAnimation.js
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation(ref, options = {}) {
  const {
    from = { y: 50, opacity: 0 },
    to   = { y: 0,  opacity: 1 },
    duration = 0.6,
    ease     = 'power2.out',
    stagger  = 0,
    trigger  = '85%',
  } = options;

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger,
        scrollTrigger: {
          trigger: el,
          start: `top ${trigger}`,
          once: true,
          lazy: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);
}
