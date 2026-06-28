import React, { useEffect, useRef } from 'react';

// Color Palette mapping for retro pixels
const PALETTE: Record<string, string> = {
  '.': 'transparent',
  'k': '#0C0E12', // dark outline
  's': '#FDBA74', // warm skin tone
  'b': '#3B82F6', // overalls blue
  'v': '#8B5CF6', // upgraded royal purple overalls
  'h': '#EF4444', // humble red cap
  'c': '#FBBF24', // golden crown / bright gold
  'w': '#FFFFFF', // eye shine / highlight
  'g': '#10B981', // emerald stem/leaf
  'y': '#F59E0B', // gold coin / amber
  'd': '#78350F', // soil / tree trunk brown
  'r': '#EC4899', // rose blossom / pink fruit
  'u': '#B45309', // canvas sack brown
  't': '#06B6D4', // water blue
};

// --- RETRO SPRITES (12 x 12 matrices) ---

const SPRITE_HUMBLE_STAND = [
  "....kkkk....",
  "...khhhhsk..",
  "...ksssssk..",
  "....ksssk...",
  "....kbbbk...",
  "...kbbbbbk..",
  "..k.kbbbk.k.",
  "..k.kbbbk.k.",
  "....kbbbk...",
  "....kk.kk...",
  "....kb.kb...",
  "....kk.kk..."
];

const SPRITE_HUMBLE_WALK1 = [
  "....kkkk....",
  "...khhhhsk..",
  "...ksssssk..",
  "....ksssk...",
  "....kbbbk...",
  "...kbbbbbk..",
  "..k.kbbbk.k.",
  "....kbbbk...",
  "....kk.kk...",
  "....kb..kb..",
  "....kk..kk.."
];

const SPRITE_HUMBLE_WALK2 = [
  "....kkkk....",
  "...khhhhsk..",
  "...ksssssk..",
  "....ksssk...",
  "....kbbbk...",
  "...kbbbbbk..",
  "..k.kbbbk.k.",
  "....kbbbk...",
  "....kk.kk...",
  "...kb...kb..",
  "...kk...kk.."
];

const SPRITE_HUMBLE_BEND = [
  "............",
  "....kkkk....",
  "...khhhhsk..",
  "...ksssssk..",
  "....ksssk...",
  "....kbbbk...",
  "...kbbbbbk..",
  "..kbbbbbbk..",
  ".ksssssk....",
  ".kkkkkk.....",
  "..kk.kk....."
];

const SPRITE_ROYAL_STAND = [
  "....kkkk....",
  "...kcccsk...",
  "...ksssssk..",
  "....ksssk...",
  "....kvvvk...",
  "...kvvvvvk..",
  "..k.kvvvk.k.",
  "..k.kvvvk.k.",
  "....kvvvk...",
  "....kk.kk...",
  "....kv.kv...",
  "....kk.kk..."
];

const SPRITE_ROYAL_WALK1 = [
  "....kkkk....",
  "...kcccsk...",
  "...ksssssk..",
  "....ksssk...",
  "....kvvvk...",
  "...kvvvvvk..",
  "..k.kvvvk.k.",
  "....kvvvk...",
  "....kk.kk...",
  "....kv..kv..",
  "....kk..kk.."
];

const SPRITE_ROYAL_WALK2 = [
  "....kkkk....",
  "...kcccsk...",
  "...ksssssk..",
  "....ksssk...",
  "....kvvvk...",
  "...kvvvvvk..",
  "..k.kvvvk.k.",
  "....kvvvk...",
  "....kk.kk...",
  "...kv...kv..",
  "...kk...kk.."
];

const SPRITE_WATERING = [
  "....kkkk....",
  "...khhhhsk..",
  "...ksssssk..",
  "....ksssk...",
  "....kbbbk.k.",
  "...kbbbbkk..",
  "..k.kbbbktt.",
  "..k.kbbbk.t.",
  "....kbbbk...",
  "....kk.kk...",
  "....kb.kb...",
  "....kk.kk..."
];

const SPRITE_SEED = [
  "............",
  "............",
  "............",
  "............",
  "............",
  "............",
  "............",
  "......y.....",
  ".....ydd....",
  "....ddddd...",
  "....ddddd..."
];

const SPRITE_SPROUT = [
  "............",
  "............",
  "............",
  "............",
  "......g.....",
  ".....gg.....",
  ".....g......",
  "....gkg.....",
  ".....ddd....",
  "....ddddd...",
  "....ddddd..."
];

const SPRITE_SAPLING = [
  "............",
  "......g.....",
  ".....ggg....",
  "....g.g.g...",
  ".....gd.....",
  ".....d......",
  ".....d......",
  "....gkg.....",
  ".....ddd....",
  "....ddddd...",
  "....ddddd..."
];

const SPRITE_LUSH_TREE = [
  ".....ggg....",
  "....ggggg...",
  "...ggggggg..",
  "..ggggggggg.",
  "...ggdgdgg..",
  ".....ddd....",
  ".....ddd....",
  ".....ddd....",
  "....gkg.....",
  ".....ddd....",
  "....ddddd..."
];

const SPRITE_GOLDEN_TREE = [
  ".....yyy....",
  "....yyyyy...",
  "...yyyyyyy..",
  "..yyycycyyy.",
  "...yycydcyy.",
  ".....ddd....",
  ".....ddd....",
  ".....ddd....",
  "....yky.....",
  ".....ddd....",
  "....ddddd..."
];

const SPRITE_GOLD_BAG = [
  ".....kk.....",
  "....kyyk....",
  "...kyyyyk...",
  "..kyyyyyyk..",
  "..kyycyyyk..",
  "..kyyyyyyk..",
  "...kyyyyk...",
  "....kkkk....",
  "............",
  "............",
  "............"
];

const SPRITE_CHEST = [
  "....kkkkkk..",
  "...kyyyyyyk.",
  "..kyycyyyyk.",
  "..kkkkkkkkk.",
  "..kdddddddk.",
  "..kdydydydk.",
  "..kdddddddk.",
  "..kkkkkkkkk.",
  "............",
  "............",
  "............"
];

enum JourneyPhase {
  SOWING_SEED = 0,
  SAPLING_GROWTH = 1,
  ORCHARD_LUSH = 2,
  GOLDEN_GRACE = 3,
  FINANCIAL_FREEDOM = 4
}

export const NewsTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const updateSize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = 64; 
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const PIXEL_SCALE = 2; 
    const groundY = 44; 

    let phase = JourneyPhase.SOWING_SEED;
    let characterX = -20;
    let characterState: 'walk' | 'stand' | 'bend' | 'water' | 'celebrate' = 'walk';
    let flipX = false;
    let walkFrame = 0;
    
    let plant1Stage = 0; 
    let plant2Stage = 0; 
    
    let particles: Array<{ x: number, y: number, color: string, vy: number, alpha: number, text?: string }> = [];
    let cycleTimer = 0;
    let activeLabel = "INVESTOR JOURNEY: 1. SOWING THE SEEDS";

    const triggerFloat = (x: number, y: number, text: string, color: string = '#10B981') => {
      particles.push({
        x,
        y,
        color,
        vy: -0.8,
        alpha: 1.0,
        text
      });
    };

    const triggerBurst = (x: number, y: number, color: string, count: number = 8) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() * 16 - 8),
          y: y + (Math.random() * 12 - 6),
          color,
          vy: -(Math.random() * 1.2 + 0.4),
          alpha: 1.0
        });
      }
    };

    let animationFrameId: number;

    const gameLoop = () => {
      if (!ctx || !canvas) return;

      // Draw background
      ctx.fillStyle = "#0B0D12";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(34, 39, 49, 0.25)";
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.fillRect(x, 0, 1, groundY);
      }
      for (let y = 0; y < groundY; y += 12) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      const gradient = ctx.createLinearGradient(0, groundY - 15, 0, groundY);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.0)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.08)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, groundY - 15, canvas.width, 15);

      ctx.fillStyle = "#1E293B"; 
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.fillStyle = "#111827"; 
      ctx.fillRect(0, groundY + 4, canvas.width, canvas.height - (groundY + 4));

      ctx.fillStyle = "#10B981"; 
      for (let x = 0; x < canvas.width; x += 6) {
        ctx.fillRect(x, groundY, 3, 2);
        if (x % 18 === 0) {
          ctx.fillRect(x + 2, groundY + 2, 2, 1); 
        }
      }

      if (phase >= JourneyPhase.ORCHARD_LUSH) {
        drawSprite(SPRITE_LUSH_TREE, 24, groundY - 20);
      }
      if (phase >= JourneyPhase.FINANCIAL_FREEDOM) {
        drawSprite(SPRITE_CHEST, canvas.width - 64, groundY - 14);
      }

      cycleTimer++;
      
      const centerTargetX = Math.floor(canvas.width / 2);

      if (cycleTimer % 6 === 0) {
        walkFrame = walkFrame === 0 ? 1 : 0;
      }

      switch (phase) {
        case JourneyPhase.SOWING_SEED:
          activeLabel = "INVESTOR JOURNEY: 1. SOWING THE SEEDS";

          if (cycleTimer < 60) {
            characterState = 'walk';
            flipX = false;
            characterX += 1.5;
            if (characterX >= centerTargetX - 12) characterX = centerTargetX - 12;
          } else if (cycleTimer === 60) {
            characterState = 'bend';
            plant1Stage = 1; 
            triggerFloat(centerTargetX, groundY - 10, "SOW SEED ($10)", "#F59E0B");
            triggerBurst(centerTargetX + 10, groundY + 4, "#78350F", 4);
          } else if (cycleTimer < 120) {
            characterState = 'stand';
          } else if (cycleTimer < 180) {
            plant1Stage = 2;
            if (cycleTimer === 121) {
              triggerFloat(centerTargetX + 8, groundY - 14, "+YIELD ACTIVE", "#10B981");
              triggerBurst(centerTargetX + 10, groundY - 6, "#10B981", 5);
            }
          } else if (cycleTimer < 230) {
            if (cycleTimer === 181) {
              characterState = 'bend';
              plant1Stage = 0; 
              triggerFloat(centerTargetX, groundY - 12, "+$15 COIN HARVESTED", "#FBBF24");
              triggerBurst(centerTargetX + 10, groundY - 4, "#FBBF24", 8);
            }
          } else {
            phase = JourneyPhase.SAPLING_GROWTH;
            cycleTimer = 0;
            characterX = centerTargetX - 12;
          }
          break;

        case JourneyPhase.SAPLING_GROWTH:
          activeLabel = "INVESTOR JOURNEY: 2. CULTIVATING ASSETS";

          if (cycleTimer < 40) {
            characterState = 'water';
            if (cycleTimer % 8 === 0) {
              triggerBurst(centerTargetX + 12, groundY - 4, "#06B6D4", 3);
            }
            plant1Stage = 2; 
          } else if (cycleTimer < 120) {
            characterState = 'stand';
            plant1Stage = 3; 
            if (cycleTimer === 41) {
              triggerFloat(centerTargetX + 10, groundY - 18, "SAPLING ASSET UPGRADE", "#10B981");
              triggerBurst(centerTargetX + 10, groundY - 10, "#10B981", 8);
            }
          } else if (cycleTimer < 180) {
            characterState = 'bend';
            plant1Stage = 0; 
            if (cycleTimer === 121) {
              triggerFloat(centerTargetX, groundY - 15, "+$150 COLLATERAL VALUE", "#F59E0B");
              triggerBurst(centerTargetX + 10, groundY - 8, "#F59E0B", 10);
            }
          } else {
            phase = JourneyPhase.ORCHARD_LUSH;
            cycleTimer = 0;
            characterX = centerTargetX - 12;
          }
          break;

        case JourneyPhase.ORCHARD_LUSH:
          activeLabel = "INVESTOR JOURNEY: 3. MULTIPLYING VALUATION";

          if (cycleTimer < 30) {
            characterState = 'bend';
            plant1Stage = 1;
            plant2Stage = 1;
            if (cycleTimer === 1) {
              triggerFloat(centerTargetX - 30, groundY - 10, "SOW 1", "#10B981");
              triggerFloat(centerTargetX + 30, groundY - 10, "SOW 2", "#10B981");
            }
          } else if (cycleTimer < 90) {
            characterState = 'stand';
            plant1Stage = 2;
            plant2Stage = 2;
          } else if (cycleTimer < 170) {
            characterState = 'water';
            plant1Stage = 3;
            plant2Stage = 3;
            if (cycleTimer % 10 === 0) {
              triggerBurst(centerTargetX - 25, groundY - 2, "#06B6D4", 2);
              triggerBurst(centerTargetX + 25, groundY - 2, "#06B6D4", 2);
            }
          } else if (cycleTimer < 240) {
            characterState = 'bend';
            if (cycleTimer === 171) {
              plant1Stage = 0;
              plant2Stage = 0;
              triggerFloat(centerTargetX - 20, groundY - 15, "+$1,200 HARVEST", "#10B981");
              triggerFloat(centerTargetX + 20, groundY - 15, "+$1,200 LIQUIDITY", "#10B981");
              triggerBurst(centerTargetX - 20, groundY - 5, "#FBBF24", 8);
              triggerBurst(centerTargetX + 20, groundY - 5, "#FBBF24", 8);
            }
          } else {
            phase = JourneyPhase.GOLDEN_GRACE;
            cycleTimer = 0;
            characterX = centerTargetX - 12;
          }
          break;

        case JourneyPhase.GOLDEN_GRACE:
          activeLabel = "INVESTOR JOURNEY: 4. THE GOLDEN YIELD";

          if (cycleTimer < 50) {
            characterState = 'bend';
            plant1Stage = 1; 
            if (cycleTimer === 1) {
              triggerFloat(centerTargetX, groundY - 12, "GOLDEN MICRO-CAP CAPITAL", "#EF4444");
            }
          } else if (cycleTimer < 130) {
            characterState = 'water';
            plant1Stage = 3; 
            if (cycleTimer % 6 === 0) {
              triggerBurst(centerTargetX + 12, groundY - 4, "#06B6D4", 2);
            }
          } else if (cycleTimer < 230) {
            characterState = 'celebrate';
            plant1Stage = 5; 
            if (cycleTimer === 131) {
              triggerFloat(centerTargetX, groundY - 25, "MAJESTIC YIELD TREE +38% APR", "#FBBF24");
              triggerBurst(centerTargetX + 12, groundY - 18, "#F59E0B", 15);
            }
            if (cycleTimer % 8 === 0) {
              triggerBurst(centerTargetX + 12, groundY - 20, "#FBBF24", 2);
            }
          } else if (cycleTimer < 280) {
            characterState = 'bend';
            if (cycleTimer === 231) {
              plant1Stage = 0;
              triggerFloat(centerTargetX, groundY - 20, "BAGGING $12,500 PROCEEDS", "#10B981");
              triggerBurst(centerTargetX + 12, groundY - 10, "#F59E0B", 20);
            }
          } else {
            phase = JourneyPhase.FINANCIAL_FREEDOM;
            cycleTimer = 0;
            characterX = centerTargetX - 12;
          }
          break;

        case JourneyPhase.FINANCIAL_FREEDOM:
          activeLabel = "INVESTOR JOURNEY: 5. GRACE REACHED - FINANCIAL FREEDOM!";

          if (cycleTimer < 60) {
            characterState = 'walk';
            flipX = false;
            characterX += 1.8;
            if (characterX >= canvas.width - 82) characterX = canvas.width - 82;
          } else if (cycleTimer < 180) {
            characterState = 'celebrate';
            if (cycleTimer % 15 === 0) {
              triggerFloat(characterX + 6, groundY - 24, "FINANCIAL SECURITY REACHED", "#FBBF24");
              triggerBurst(characterX + 6, groundY - 16, "#10B981", 6);
              triggerBurst(canvas.width - 56, groundY - 10, "#FBBF24", 8);
            }
          } else if (cycleTimer < 240) {
            characterState = 'walk';
            flipX = true;
            characterX -= 2.0;
          } else {
            phase = JourneyPhase.SOWING_SEED;
            cycleTimer = 0;
            characterX = -20;
            plant1Stage = 0;
            plant2Stage = 0;
          }
          break;
      }

      if (plant1Stage > 0) {
        let plantSprite = SPRITE_SEED;
        let px = centerTargetX + 12;
        if (plant1Stage === 2) plantSprite = SPRITE_SPROUT;
        if (plant1Stage === 3) plantSprite = SPRITE_SAPLING;
        if (plant1Stage === 4) plantSprite = SPRITE_LUSH_TREE;
        if (plant1Stage === 5) {
          plantSprite = SPRITE_GOLDEN_TREE;
          drawSprite(SPRITE_GOLD_BAG, centerTargetX + 28, groundY - 14);
        }
        drawSprite(plantSprite, px, groundY - 16);
      }

      if (plant2Stage > 0) {
        let plantSprite = SPRITE_SEED;
        let px = centerTargetX - 32;
        if (plant2Stage === 2) plantSprite = SPRITE_SPROUT;
        if (plant2Stage === 3) plantSprite = SPRITE_SAPLING;
        drawSprite(plantSprite, px, groundY - 16);
      }

      let activeSprite = SPRITE_HUMBLE_STAND;
      const isRoyal = phase >= JourneyPhase.GOLDEN_GRACE;

      if (characterState === 'walk') {
        if (isRoyal) {
          activeSprite = walkFrame === 0 ? SPRITE_ROYAL_WALK1 : SPRITE_ROYAL_WALK2;
        } else {
          activeSprite = walkFrame === 0 ? SPRITE_HUMBLE_WALK1 : SPRITE_HUMBLE_WALK2;
        }
      } else if (characterState === 'bend') {
        activeSprite = SPRITE_HUMBLE_BEND; 
      } else if (characterState === 'water') {
        activeSprite = SPRITE_WATERING; 
      } else if (characterState === 'celebrate') {
        if (isRoyal) {
          activeSprite = SPRITE_ROYAL_STAND;
        } else {
          activeSprite = SPRITE_HUMBLE_STAND;
        }
      }

      let jumpY = 0;
      if (characterState === 'celebrate' && cycleTimer % 12 < 6) {
        jumpY = -4; 
      }

      drawSprite(activeSprite, characterX, groundY - 16 + jumpY, flipX);

      if (isRoyal) {
        ctx.fillStyle = "#F59E0B";
        const crownX = characterX + 4;
        const crownY = groundY - 20 + jumpY;
        ctx.fillRect(crownX, crownY, 8, 2);
        ctx.fillRect(crownX + 1, crownY - 2, 1, 2);
        ctx.fillRect(crownX + 3, crownY - 3, 2, 3);
        ctx.fillRect(crownX + 6, crownY - 2, 1, 2);
      }

      particles.forEach((p, index) => {
        p.y += p.vy;
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.globalAlpha = p.alpha;
        if (p.text) {
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#000000';
          ctx.fillText(p.text, p.x + 1, p.y + 1);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 2, 2);
        }
      });
      ctx.globalAlpha = 1.0; 

      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.fillRect(12, 12, 4, 12);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = 'bold 9px monospace';
      ctx.fillText(activeLabel, 22, 21);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    function drawSprite(sprite: string[], x: number, y: number, flip: boolean = false) {
      if (!ctx) return;
      const h = sprite.length;
      const w = sprite[0].length;
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          const char = sprite[r][c];
          if (char && char !== '.') {
            ctx.fillStyle = PALETTE[char] || 'transparent';
            const drawX = flip ? x + (w - 1 - c) * PIXEL_SCALE : x + c * PIXEL_SCALE;
            const drawY = y + r * PIXEL_SCALE;
            ctx.fillRect(drawX, drawY, PIXEL_SCALE, PIXEL_SCALE);
          }
        }
      }
    }

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, []); // Empty dependency array ensures it initializes once, runs dynamically and never gets disrupted or reset by React render loops!

  return (
    <div 
      id="pixel-investor-journey" 
      ref={containerRef}
      className="w-full bg-[#0E1116] border-b border-[#222731] flex flex-col h-16 overflow-hidden relative select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};
