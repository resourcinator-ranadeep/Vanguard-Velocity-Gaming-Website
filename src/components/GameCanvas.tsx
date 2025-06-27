import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface GameCanvasProps {
  onClose: () => void;
}

interface Tank {
  x: number;
  y: number;
  velocityY: number;
  onGround: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface Missile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
}

interface Explosion {
  x: number;
  y: number;
  frame: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Game constants
  const GRAVITY = 1.2;
  const JUMP_FORCE = -20;
  const TANK_X = 50;
  const TANK_WIDTH = 40;
  const TANK_HEIGHT = 30;
  const GROUND_Y_OFFSET = 50;
  const MISSILE_ACTIVATION_SCORE = 1000;
  const MISSILES_TO_GAIN_ONE = 25;
  const MAX_MISSILES = 10;
  const MISSILE_SPEED = 15;
  const SKY_CYCLE_DURATION = 1200;
  const BG_MOUNTAIN_SPEED = 0.2;
  const BG_TREE_SPEED = 0.8;
  const MIN_OBSTACLE_SPAWN_INTERVAL = 60;
  const MAX_OBSTACLE_SPAWN_INTERVAL = 120;
  const OBSTACLE_SPAWN_MIN = 30;
  const MIN_FLYING_OBSTACLE_HEIGHT = 100;
  const MAX_FLYING_OBSTACLE_HEIGHT = 300;

  // Color palettes
  const DAY_COLORS = {
    sky: '#87CEEB',
    ground: '#8B4513',
    groundDetail: '#A0522D',
    mountain: '#696969',
    tree: '#228B22',
    sun: '#FFD700',
    tank: '#4B4B4D',
    obstacle: '#8B0000'
  };

  const NIGHT_COLORS = {
    sky: '#191970',
    ground: '#2F4F4F',
    groundDetail: '#708090',
    mountain: '#2F2F2F',
    tree: '#006400',
    sun: '#F5F5DC',
    tank: '#36454F',
    obstacle: '#8B0000'
  };

  // Game state
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [missiles, setMissiles] = useState(0);
  const [missilesReady, setMissilesReady] = useState(false);
  const [obstaclesDodged, setObstaclesDodged] = useState(0);

  // Game objects
  const [tank, setTank] = useState<Tank>({
    x: TANK_X,
    y: 300,
    velocityY: 0,
    onGround: true
  });
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Missile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  // Game variables
  const [frameCount, setFrameCount] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [obstacleSpawnTimer, setObstacleSpawnTimer] = useState(0);
  const [minSpawnInterval, setMinSpawnInterval] = useState(MIN_OBSTACLE_SPAWN_INTERVAL);
  const [maxSpawnInterval, setMaxSpawnInterval] = useState(MAX_OBSTACLE_SPAWN_INTERVAL);
  const [skyCycleProgress, setSkyCycleProgress] = useState(0);
  const [bgMountainScrollX, setBgMountainScrollX] = useState(0);
  const [bgTreeScrollX, setBgTreeScrollX] = useState(0);
  const [currentColors, setCurrentColors] = useState(DAY_COLORS);

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('vanguardVelocityHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score when it changes
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem('vanguardVelocityHighScore', highScore.toString());
    }
  }, [highScore]);

  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const updateDynamicColors = useCallback((progress: number) => {
    const newColors = {
      sky: interpolateColor(DAY_COLORS.sky, NIGHT_COLORS.sky, progress),
      ground: interpolateColor(DAY_COLORS.ground, NIGHT_COLORS.ground, progress),
      groundDetail: interpolateColor(DAY_COLORS.groundDetail, NIGHT_COLORS.groundDetail, progress),
      mountain: interpolateColor(DAY_COLORS.mountain, NIGHT_COLORS.mountain, progress),
      tree: interpolateColor(DAY_COLORS.tree, NIGHT_COLORS.tree, progress),
      sun: interpolateColor(DAY_COLORS.sun, NIGHT_COLORS.sun, progress),
      tank: interpolateColor(DAY_COLORS.tank, NIGHT_COLORS.tank, progress),
      obstacle: interpolateColor(DAY_COLORS.obstacle, NIGHT_COLORS.obstacle, progress)
    };
    setCurrentColors(newColors);
  }, []);

  const drawTank = (ctx: CanvasRenderingContext2D, tankObj: Tank) => {
    const { x, y } = tankObj;
    
    // Tank body
    ctx.fillStyle = currentColors.tank;
    ctx.fillRect(x, y, TANK_WIDTH, TANK_HEIGHT);
    
    // Tank tracks
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 2, y + TANK_HEIGHT - 5, TANK_WIDTH + 4, 5);
    
    // Tank turret
    ctx.fillStyle = currentColors.tank;
    ctx.fillRect(x + 10, y - 8, 20, 12);
    
    // Tank cannon
    ctx.fillStyle = '#666';
    ctx.fillRect(x + 30, y - 2, 15, 4);
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    const { x, y, width, height, type } = obstacle;
    
    ctx.fillStyle = currentColors.obstacle;
    
    switch (type) {
      case 'wall':
        ctx.fillRect(x, y, width, height);
        break;
      case 'enemy_tank_light':
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 5, y - 5, width - 10, 8);
        break;
      case 'enemy_tank_heavy':
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 8, y - 8, width - 16, 12);
        break;
      case 'group_of_soldiers':
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(x + i * 8, y, 6, height);
        }
        break;
      case 'fighter_jet':
        ctx.fillRect(x, y + height / 2 - 3, width, 6);
        ctx.fillRect(x + width / 3, y, width / 3, height);
        break;
      case 'helicopter':
        ctx.fillRect(x, y + height / 2 - 4, width, 8);
        ctx.fillRect(x + width / 2 - 2, y - 5, 4, 10);
        break;
    }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Sky
    ctx.fillStyle = currentColors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height - GROUND_Y_OFFSET);
    
    // Mountains (background layer)
    ctx.fillStyle = currentColors.mountain;
    const mountainY = canvas.height - GROUND_Y_OFFSET - 100;
    for (let i = 0; i < 3; i++) {
      const x = (bgMountainScrollX + i * 300) % (canvas.width + 300);
      ctx.fillRect(x, mountainY, 200, 100);
      ctx.fillRect(x + 50, mountainY - 30, 100, 130);
    }
    
    // Trees (foreground layer)
    ctx.fillStyle = currentColors.tree;
    const treeY = canvas.height - GROUND_Y_OFFSET - 40;
    for (let i = 0; i < 5; i++) {
      const x = (bgTreeScrollX + i * 150) % (canvas.width + 150);
      ctx.fillRect(x + 20, treeY, 10, 40);
      ctx.fillRect(x + 10, treeY - 20, 30, 20);
    }
  };

  const drawSunMoon = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 4;
    const radius = 80;
    
    const angle = skyCycleProgress * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius / 2;
    
    if (skyCycleProgress < 0.5) {
      // Sun
      ctx.fillStyle = currentColors.sun;
      ctx.fillRect(x - 15, y - 15, 30, 30);
    } else {
      // Moon
      ctx.fillStyle = currentColors.sun;
      ctx.fillRect(x - 12, y - 12, 24, 24);
      // Moon craters
      ctx.fillStyle = currentColors.sky;
      ctx.fillRect(x - 5, y - 5, 4, 4);
      ctx.fillRect(x + 2, y + 2, 3, 3);
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const groundY = canvas.height - GROUND_Y_OFFSET;
    
    // Main ground
    ctx.fillStyle = currentColors.ground;
    ctx.fillRect(0, groundY, canvas.width, GROUND_Y_OFFSET);
    
    // Ground details
    ctx.fillStyle = currentColors.groundDetail;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.fillRect(x, groundY + 10, 15, 5);
    }
  };

  const drawMissile = (ctx: CanvasRenderingContext2D, missile: Missile) => {
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(missile.x, missile.y, 12, 4);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(missile.x - 3, missile.y + 1, 3, 2);
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    const colors = ['#FF4500', '#FFD700', '#FF6347'];
    const color = colors[explosion.frame % colors.length];
    ctx.fillStyle = color;
    
    const size = 20 - explosion.frame * 2;
    if (size > 0) {
      ctx.fillRect(explosion.x - size / 2, explosion.y - size / 2, size, size);
    }
  };

  const checkCollision = (rect1: any, rect2: any): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const spawnObstacle = (canvas: HTMLCanvasElement) => {
    const types = ['wall', 'enemy_tank_light', 'enemy_tank_heavy', 'group_of_soldiers', 'fighter_jet', 'helicopter'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width, height, y;
    
    switch (type) {
      case 'wall':
        width = 20 + Math.random() * 30;
        height = 40 + Math.random() * 60;
        y = canvas.height - GROUND_Y_OFFSET - height;
        break;
      case 'enemy_tank_light':
        width = 30;
        height = 20;
        y = canvas.height - GROUND_Y_OFFSET - height;
        break;
      case 'enemy_tank_heavy':
        width = 50;
        height = 35;
        y = canvas.height - GROUND_Y_OFFSET - height;
        break;
      case 'group_of_soldiers':
        width = 24;
        height = 15;
        y = canvas.height - GROUND_Y_OFFSET - height;
        break;
      case 'fighter_jet':
        width = 40;
        height = 20;
        y = MIN_FLYING_OBSTACLE_HEIGHT + Math.random() * (MAX_FLYING_OBSTACLE_HEIGHT - MIN_FLYING_OBSTACLE_HEIGHT);
        break;
      case 'helicopter':
        width = 35;
        height = 25;
        y = MIN_FLYING_OBSTACLE_HEIGHT + Math.random() * (MAX_FLYING_OBSTACLE_HEIGHT - MIN_FLYING_OBSTACLE_HEIGHT);
        break;
      default:
        width = 30;
        height = 30;
        y = canvas.height - GROUND_Y_OFFSET - height;
    }
    
    return {
      x: canvas.width,
      y,
      width,
      height,
      type
    };
  };

  const fireMissile = () => {
    if (missiles > 0 && obstacles.length > 0) {
      const closestObstacle = obstacles.reduce((closest, obstacle) => {
        return obstacle.x < closest.x ? closest : obstacle;
      });
      
      const newMissile: Missile = {
        x: tank.x + TANK_WIDTH,
        y: tank.y + TANK_HEIGHT / 2,
        targetX: closestObstacle.x + closestObstacle.width / 2,
        targetY: closestObstacle.y + closestObstacle.height / 2,
        speed: MISSILE_SPEED
      };
      
      setProjectiles(prev => [...prev, newMissile]);
      setMissiles(prev => prev - 1);
    }
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;
    
    if (gameState === 'playing') {
      // Update frame count and cycles
      setFrameCount(prev => prev + 1);
      setSkyCycleProgress(prev => (prev + 1 / SKY_CYCLE_DURATION) % 1);
      
      // Update background scroll
      setBgMountainScrollX(prev => prev - BG_MOUNTAIN_SPEED);
      setBgTreeScrollX(prev => prev - BG_TREE_SPEED);
      
      // Update tank physics
      setTank(prev => {
        const newTank = { ...prev };
        newTank.velocityY += GRAVITY;
        newTank.y += newTank.velocityY;
        
        const groundLevel = canvas.height - GROUND_Y_OFFSET - TANK_HEIGHT;
        if (newTank.y >= groundLevel) {
          newTank.y = groundLevel;
          newTank.velocityY = 0;
          newTank.onGround = true;
        } else {
          newTank.onGround = false;
        }
        
        return newTank;
      });
      
      // Update obstacles
      setObstacles(prev => {
        const updated = prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - gameSpeed
        })).filter(obstacle => obstacle.x + obstacle.width > 0);
        
        // Check for dodged obstacles
        const dodged = prev.filter(obstacle => 
          obstacle.x + obstacle.width < TANK_X && obstacle.x + obstacle.width >= TANK_X - gameSpeed
        );
        
        if (dodged.length > 0) {
          setObstaclesDodged(prevDodged => {
            const newDodged = prevDodged + dodged.length;
            if (missilesReady && newDodged % MISSILES_TO_GAIN_ONE === 0 && missiles < MAX_MISSILES) {
              setMissiles(prevMissiles => Math.min(prevMissiles + 1, MAX_MISSILES));
            }
            return newDodged;
          });
        }
        
        return updated;
      });
      
      // Update missiles
      setProjectiles(prev => {
        return prev.map(missile => {
          const dx = missile.targetX - missile.x;
          const dy = missile.targetY - missile.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > missile.speed) {
            const moveX = (dx / distance) * missile.speed;
            const moveY = (dy / distance) * missile.speed;
            return {
              ...missile,
              x: missile.x + moveX,
              y: missile.y + moveY
            };
          } else {
            return {
              ...missile,
              x: missile.x + missile.speed,
              y: missile.y
            };
          }
        }).filter(missile => missile.x < canvas.width);
      });
      
      // Update explosions
      setExplosions(prev => 
        prev.map(explosion => ({
          ...explosion,
          frame: explosion.frame + 1
        })).filter(explosion => explosion.frame < 10)
      );
      
      // Spawn obstacles
      setObstacleSpawnTimer(prev => {
        if (prev <= 0) {
          setObstacles(prevObstacles => [...prevObstacles, spawnObstacle(canvas)]);
          return minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
        }
        return prev - 1;
      });
      
      // Check collisions
      const tankRect = { x: tank.x, y: tank.y, width: TANK_WIDTH, height: TANK_HEIGHT };
      
      // Tank-obstacle collisions
      for (const obstacle of obstacles) {
        if (checkCollision(tankRect, obstacle)) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
          }
          break;
        }
      }
      
      // Missile-obstacle collisions
      setProjectiles(prevMissiles => {
        const remainingMissiles = [];
        
        for (const missile of prevMissiles) {
          let hit = false;
          const missileRect = { x: missile.x, y: missile.y, width: 12, height: 4 };
          
          setObstacles(prevObstacles => {
            return prevObstacles.filter(obstacle => {
              if (checkCollision(missileRect, obstacle)) {
                setExplosions(prev => [...prev, { x: obstacle.x + obstacle.width / 2, y: obstacle.y + obstacle.height / 2, frame: 0 }]);
                hit = true;
                return false;
              }
              return true;
            });
          });
          
          if (!hit) {
            remainingMissiles.push(missile);
          }
        }
        
        return remainingMissiles;
      });
      
      // Update score and difficulty
      setScore(prev => {
        const newScore = prev + 1;
        
        // Increase game speed every 200 points
        if (newScore % 200 === 0) {
          setGameSpeed(prevSpeed => prevSpeed + 0.5);
        }
        
        // Decrease spawn intervals every 100 points
        if (newScore % 100 === 0) {
          setMinSpawnInterval(prev => Math.max(prev - 2, OBSTACLE_SPAWN_MIN));
          setMaxSpawnInterval(prev => Math.max(prev - 3, OBSTACLE_SPAWN_MIN + 10));
        }
        
        // Activate missiles at 1000 points
        if (newScore >= MISSILE_ACTIVATION_SCORE && !missilesReady) {
          setMissilesReady(true);
        }
        
        return newScore;
      });
    }
    
    // Update dynamic colors
    updateDynamicColors(skyCycleProgress);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawBackground(ctx, canvas);
    drawSunMoon(ctx, canvas);
    drawGround(ctx, canvas);
    
    // Draw game objects
    drawTank(ctx, tank);
    obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));
    projectiles.forEach(missile => drawMissile(ctx, missile));
    explosions.forEach(explosion => drawExplosion(ctx, explosion));
    
    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, tank, obstacles, projectiles, explosions, frameCount, gameSpeed, obstacleSpawnTimer, minSpawnInterval, maxSpawnInterval, skyCycleProgress, bgMountainScrollX, bgTreeScrollX, currentColors, score, highScore, missiles, missilesReady, obstaclesDodged, updateDynamicColors]);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start') {
          setGameState('playing');
        } else if (gameState === 'playing' && tank.onGround) {
          setTank(prev => ({ ...prev, velocityY: JUMP_FORCE, onGround: false }));
        }
      } else if (e.code === 'KeyF' && gameState === 'playing' && missilesReady) {
        e.preventDefault();
        fireMissile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, tank.onGround, missilesReady, missiles, obstacles]);

  // Handle canvas click/touch
  const handleCanvasInteraction = () => {
    if (gameState === 'start') {
      setGameState('playing');
    } else if (gameState === 'playing' && tank.onGround) {
      setTank(prev => ({ ...prev, velocityY: JUMP_FORCE, onGround: false }));
    }
  };

  const restartGame = () => {
    setGameState('start');
    setScore(0);
    setMissiles(0);
    setMissilesReady(false);
    setObstaclesDodged(0);
    setTank({
      x: TANK_X,
      y: 300,
      velocityY: 0,
      onGround: true
    });
    setObstacles([]);
    setProjectiles([]);
    setExplosions([]);
    setFrameCount(0);
    setGameSpeed(3);
    setObstacleSpawnTimer(0);
    setMinSpawnInterval(MIN_OBSTACLE_SPAWN_INTERVAL);
    setMaxSpawnInterval(MAX_OBSTACLE_SPAWN_INTERVAL);
    setSkyCycleProgress(0);
    setBgMountainScrollX(0);
    setBgTreeScrollX(0);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas mx-auto my-auto border-2 border-gray-600"
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
      />

      {/* Game UI */}
      <div className="absolute top-4 left-4 font-press-start-2p text-white">
        <div className="bg-black/80 p-2 rounded mb-2">
          <div className="text-yellow-400">SCORE: {score}</div>
        </div>
        <div className="bg-black/80 p-2 rounded">
          <div className="text-green-400">HIGH: {highScore}</div>
        </div>
        {missilesReady && (
          <div className="bg-black/80 p-2 rounded mt-2">
            <div className="text-red-400">MISSILES: {missiles}/10</div>
          </div>
        )}
      </div>

      {/* Start message */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-lg text-center font-press-start-2p">
            <div className="text-yellow-400 text-xl mb-4">VANGUARD VELOCITY</div>
            <div className="text-white">Press SPACE or Tap to Start</div>
          </div>
        </div>
      )}

      {/* Game over screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
          <div className="bg-black/90 p-8 rounded-lg text-center font-press-start-2p">
            <div className="text-red-400 text-2xl mb-4">GAME OVER!</div>
            <div className="text-white mb-4">Score: {score}</div>
            {score === highScore && (
              <div className="text-yellow-400 mb-4">NEW HIGH SCORE!</div>
            )}
            <button
              onClick={restartGame}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded transition-colors"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Fire missile button */}
      {gameState === 'playing' && missilesReady && missiles > 0 && (
        <button
          onClick={fireMissile}
          className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-press-start-2p text-sm transition-colors"
        >
          FIRE MISSILE
        </button>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 font-press-start-2p text-white text-xs">
        <div className="bg-black/80 p-2 rounded">
          <div>SPACE: Jump</div>
          {missilesReady && <div>F: Fire Missile</div>}
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;