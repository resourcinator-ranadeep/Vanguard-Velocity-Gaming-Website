import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, RotateCcw, Pause, Play, Settings, Target, RotateCw } from 'lucide-react';

interface GameCanvasProps {
  onClose: () => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  size?: 'small' | 'medium' | 'large';
  countedForMissile?: boolean;
  isLowFlying?: boolean;
}

interface Missile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  active: boolean;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }>;
}

interface Tree {
  x: number;
  y: number;
  height: number;
  trunkWidth: number;
  crownRadius: number;
  branches: Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    thickness: number;
  }>;
  leaves: Array<{
    x: number;
    y: number;
    size: number;
  }>;
  treeType: 'oak' | 'pine' | 'birch' | 'maple';
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'house' | 'tower' | 'factory' | 'barn';
  color: string;
  windows: Array<{ x: number; y: number; width: number; height: number }>;
}

interface Mountain {
  x: number;
  y: number;
  width: number;
  height: number;
  peaks: Array<{ x: number; y: number }>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tankGameHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(4.0);
  const [showSettings, setShowSettings] = useState(false);
  const [initialSpeed, setInitialSpeed] = useState(4.0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device and orientation
  useEffect(() => {
    const checkMobileAndOrientation = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 768 && 'ontouchstart' in window);
      const isPortraitMode = window.innerHeight > window.innerWidth;
      
      setIsMobile(isMobileDevice);
      setIsPortrait(isPortraitMode && isMobileDevice);
    };

    checkMobileAndOrientation();
    window.addEventListener('resize', checkMobileAndOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobileAndOrientation, 100); // Delay to ensure orientation change is complete
    });

    return () => {
      window.removeEventListener('resize', checkMobileAndOrientation);
      window.removeEventListener('orientationchange', checkMobileAndOrientation);
    };
  }, []);

  // Game state - Increased initial speed for better gameplay
  const gameState = useRef({
    tank: { x: 100, y: 280, width: 60, height: 40, velocityY: 0, onGround: true },
    obstacles: [] as GameObject[],
    missiles: [] as Missile[],
    explosions: [] as Explosion[],
    trees: [] as Tree[],
    buildings: [] as Building[],
    mountains: [] as Mountain[],
    lastObstacleX: 0,
    keys: { space: false, up: false },
    gameSpeed: 4.0, // Increased from 3.0 to 4.0
    frameCount: 0,
    timeOfDay: 0,
    dayNightCycle: 0,
    backgroundOffset: 0,
    missileUnlocked: false,
    lastMissileTime: 0,
    missileTarget: null as GameObject | null,
    nextObstacleSpawn: 0,
    minObstacleSpawnInterval: 60, // Reduced from 80 to 60 for more frequent obstacles
    maxObstacleSpawnInterval: 180, // Reduced from 250 to 180
    missileCount: 0,
    dodgedObstaclesCount: 0,
    missilesReady: false,
    sunMoonPosition: { x: 200, y: 80 },
    environmentType: 'forest' as 'forest' | 'urban',
    environmentTransition: 0
  });

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 350;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const TANK_SPEED = 3;

  // Missile system constants
  const MISSILE_ACTIVATION_SCORE = 100;
  const MISSILES_TO_GAIN_ONE = 25;
  const MAX_MISSILES = 10;
  const OBSTACLE_SPAWN_DECREASE_RATE = 5;
  const OBSTACLE_SPAWN_MIN = 30; // Reduced from 40 to 30
  const MAX_GAME_SPEED = 10;

  // Initialize background elements
  const initializeBackground = useCallback(() => {
    // Initialize trees
    const trees: Tree[] = [];
    for (let i = 0; i < 30; i++) {
      const treeTypes: Array<'oak' | 'pine' | 'birch' | 'maple'> = ['oak', 'pine', 'birch', 'maple'];
      const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
      
      const baseHeight = treeType === 'pine' ? 80 : 60;
      const height = baseHeight + Math.random() * 40;
      const trunkWidth = 8 + Math.random() * 6;
      const crownRadius = treeType === 'pine' ? height * 0.3 : height * 0.4 + Math.random() * 10;
      
      const tree: Tree = {
        x: i * 150 + Math.random() * 50,
        y: GROUND_Y - height,
        height,
        trunkWidth,
        crownRadius,
        branches: [],
        leaves: [],
        treeType
      };

      // Generate branches
      const branchCount = treeType === 'pine' ? 8 : 5 + Math.random() * 5;
      for (let j = 0; j < branchCount; j++) {
        const branchY = tree.y + height * 0.3 + (j / branchCount) * height * 0.4;
        const branchLength = 15 + Math.random() * 20;
        const angle = (Math.random() - 0.5) * Math.PI * 0.6;
        
        tree.branches.push({
          startX: tree.x + trunkWidth / 2,
          startY: branchY,
          endX: tree.x + trunkWidth / 2 + Math.cos(angle) * branchLength,
          endY: branchY + Math.sin(angle) * branchLength,
          thickness: 2 + Math.random() * 3
        });
      }

      // Generate leaves
      const leafCount = treeType === 'pine' ? 20 : 15 + Math.random() * 10;
      for (let j = 0; j < leafCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * crownRadius;
        tree.leaves.push({
          x: tree.x + trunkWidth / 2 + Math.cos(angle) * distance,
          y: tree.y + height * 0.2 + Math.sin(angle) * distance,
          size: 3 + Math.random() * 4
        });
      }

      trees.push(tree);
    }

    // Initialize buildings
    const buildings: Building[] = [];
    for (let i = 0; i < 20; i++) {
      const buildingTypes: Array<'house' | 'tower' | 'factory' | 'barn'> = ['house', 'tower', 'factory', 'barn'];
      const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
      
      let width, height, color;
      switch (type) {
        case 'house':
          width = 60 + Math.random() * 40;
          height = 80 + Math.random() * 40;
          color = '#8B4513';
          break;
        case 'tower':
          width = 40 + Math.random() * 20;
          height = 120 + Math.random() * 80;
          color = '#696969';
          break;
        case 'factory':
          width = 80 + Math.random() * 60;
          height = 100 + Math.random() * 50;
          color = '#4A4A4A';
          break;
        case 'barn':
          width = 70 + Math.random() * 50;
          height = 90 + Math.random() * 30;
          color = '#8B0000';
          break;
        default:
          width = 60;
          height = 80;
          color = '#8B4513';
      }

      const building: Building = {
        x: i * 200 + Math.random() * 100,
        y: GROUND_Y - height,
        width,
        height,
        type,
        color,
        windows: []
      };

      // Generate windows
      const windowRows = Math.floor(height / 25);
      const windowCols = Math.floor(width / 20);
      for (let row = 1; row < windowRows; row++) {
        for (let col = 1; col < windowCols; col++) {
          if (Math.random() > 0.3) {
            building.windows.push({
              x: building.x + col * 20,
              y: building.y + row * 25,
              width: 12,
              height: 15
            });
          }
        }
      }

      buildings.push(building);
    }

    // Initialize mountains
    const mountains: Mountain[] = [];
    for (let i = 0; i < 15; i++) {
      const width = 200 + Math.random() * 300;
      const height = 100 + Math.random() * 150;
      const mountain: Mountain = {
        x: i * 250,
        y: GROUND_Y - height,
        width,
        height,
        peaks: []
      };

      // Generate mountain peaks
      const peakCount = 3 + Math.random() * 4;
      for (let j = 0; j <= peakCount; j++) {
        mountain.peaks.push({
          x: mountain.x + (j / peakCount) * width,
          y: mountain.y + Math.random() * height * 0.3
        });
      }

      mountains.push(mountain);
    }

    gameState.current.trees = trees;
    gameState.current.buildings = buildings;
    gameState.current.mountains = mountains;
  }, []);

  // Color interpolation function
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    factor = Math.max(0, Math.min(1, factor));
    
    if (!color1.match(/^#[0-9A-Fa-f]{6}$/) || !color2.match(/^#[0-9A-Fa-f]{6}$/)) {
      return color1;
    }
    
    try {
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
      
      if (isNaN(r1) || isNaN(g1) || isNaN(b1) || isNaN(r2) || isNaN(g2) || isNaN(b2)) {
        return color1;
      }
      
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      
      const clampedR = Math.max(0, Math.min(255, r));
      const clampedG = Math.max(0, Math.min(255, g));
      const clampedB = Math.max(0, Math.min(255, b));
      
      return `rgb(${clampedR}, ${clampedG}, ${clampedB})`;
    } catch (error) {
      return color1;
    }
  };

  const drawWithOutline = (ctx: CanvasRenderingContext2D, drawFunction: () => void, outlineColor: string = '#000000', lineWidth: number = 2) => {
    ctx.save();
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Draw outline
    ctx.globalCompositeOperation = 'source-over';
    drawFunction();
    ctx.stroke();
    
    // Draw fill
    ctx.globalCompositeOperation = 'source-over';
    drawFunction();
    ctx.fill();
    
    ctx.restore();
  };

  const drawDetailedTree = (ctx: CanvasRenderingContext2D, tree: Tree, timeOfDay: number) => {
    const { x, y, height, trunkWidth, crownRadius, branches, leaves, treeType } = tree;
    
    const trunkColors = {
      oak: { day: '#8B4513', night: '#654321' },
      pine: { day: '#A0522D', night: '#704214' },
      birch: { day: '#F5F5DC', night: '#D3D3D3' },
      maple: { day: '#8B4513', night: '#654321' }
    };
    
    const leafColors = {
      oak: { day: '#228B22', night: '#1F5F1F' },
      pine: { day: '#006400', night: '#004000' },
      birch: { day: '#90EE90', night: '#5F8A5F' },
      maple: { day: '#FF6347', night: '#CC4125' }
    };
    
    const trunkColor = interpolateColor(
      trunkColors[treeType].day,
      trunkColors[treeType].night,
      timeOfDay
    );
    
    const leafColor = interpolateColor(
      leafColors[treeType].day,
      leafColors[treeType].night,
      timeOfDay
    );
    
    // Draw trunk with outline
    drawWithOutline(ctx, () => {
      ctx.fillStyle = trunkColor;
      ctx.fillRect(x, y + height * 0.7, trunkWidth, height * 0.3);
    }, '#000000', 1);
    
    // Draw branches
    ctx.strokeStyle = interpolateColor(trunkColor, '#000000', 0.2);
    branches.forEach(branch => {
      ctx.lineWidth = branch.thickness;
      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      ctx.lineTo(branch.endX, branch.endY);
      ctx.stroke();
    });
    
    // Draw crown with outline
    if (treeType === 'pine') {
      const layers = 4;
      for (let i = 0; i < layers; i++) {
        const layerY = y + (i / layers) * height * 0.7;
        const layerRadius = crownRadius * (1 - i * 0.15);
        
        drawWithOutline(ctx, () => {
          ctx.fillStyle = interpolateColor(leafColor, '#000000', i * 0.1);
          ctx.beginPath();
          ctx.moveTo(x + trunkWidth / 2, layerY);
          ctx.lineTo(x + trunkWidth / 2 - layerRadius, layerY + layerRadius);
          ctx.lineTo(x + trunkWidth / 2 + layerRadius, layerY + layerRadius);
          ctx.closePath();
        }, '#000000', 1);
      }
    } else {
      drawWithOutline(ctx, () => {
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.arc(x + trunkWidth / 2, y + height * 0.3, crownRadius, 0, Math.PI * 2);
      }, '#000000', 2);
    }
  };

  const drawBuilding = (ctx: CanvasRenderingContext2D, building: Building, timeOfDay: number) => {
    const { x, y, width, height, type, color, windows } = building;
    
    const buildingColor = interpolateColor(color, '#2F2F2F', timeOfDay);
    
    // Draw building with outline
    drawWithOutline(ctx, () => {
      ctx.fillStyle = buildingColor;
      ctx.fillRect(x, y, width, height);
    }, '#000000', 2);
    
    // Draw roof
    if (type === 'house' || type === 'barn') {
      drawWithOutline(ctx, () => {
        ctx.fillStyle = interpolateColor('#8B0000', '#4A0000', timeOfDay);
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + width / 2, y - 20);
        ctx.lineTo(x + width + 5, y);
        ctx.closePath();
      }, '#000000', 1);
    }
    
    // Draw windows
    windows.forEach(window => {
      const windowColor = timeOfDay > 0.5 ? '#FFD700' : '#87CEEB';
      drawWithOutline(ctx, () => {
        ctx.fillStyle = windowColor;
        ctx.fillRect(window.x, window.y, window.width, window.height);
      }, '#000000', 1);
    });
    
    // Draw door for houses
    if (type === 'house') {
      drawWithOutline(ctx, () => {
        ctx.fillStyle = interpolateColor('#654321', '#2F2F2F', timeOfDay);
        ctx.fillRect(x + width / 2 - 8, y + height - 25, 16, 25);
      }, '#000000', 1);
    }
  };

  const drawMountain = (ctx: CanvasRenderingContext2D, mountain: Mountain, timeOfDay: number) => {
    const { x, y, width, height, peaks } = mountain;
    
    const mountainColor = interpolateColor('#8B7355', '#4A4A4A', timeOfDay);
    
    drawWithOutline(ctx, () => {
      ctx.fillStyle = mountainColor;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      
      peaks.forEach((peak, index) => {
        if (index === 0) {
          ctx.lineTo(peak.x, peak.y);
        } else {
          ctx.lineTo(peak.x, peak.y);
        }
      });
      
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
    }, '#000000', 2);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const { timeOfDay, backgroundOffset, environmentType } = gameState.current;
    
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    const dayTopColor = '#87CEEB';
    const dayBottomColor = '#E0F6FF';
    const nightTopColor = '#191970';
    const nightBottomColor = '#483D8B';
    
    const topColor = interpolateColor(dayTopColor, nightTopColor, timeOfDay);
    const bottomColor = interpolateColor(dayBottomColor, nightBottomColor, timeOfDay);
    
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Sun/Moon - keep within bounds
    const cycleProgress = (gameState.current.dayNightCycle * 0.005) % (Math.PI * 2);
    const celestialX = Math.max(50, Math.min(CANVAS_WIDTH - 50, 200 + Math.cos(cycleProgress) * 400));
    const celestialY = Math.max(30, Math.min(150, 80 + Math.abs(Math.sin(cycleProgress)) * 50));
    
    gameState.current.sunMoonPosition = { x: celestialX, y: celestialY };
    
    if (timeOfDay < 0.5) {
      // Sun with outline
      drawWithOutline(ctx, () => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 25, 0, Math.PI * 2);
      }, '#FFA500', 2);
      
      // Sun rays
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startX = celestialX + Math.cos(angle) * 35;
        const startY = celestialY + Math.sin(angle) * 35;
        const endX = celestialX + Math.cos(angle) * 45;
        const endY = celestialY + Math.sin(angle) * 45;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    } else {
      // Moon with outline
      drawWithOutline(ctx, () => {
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 20, 0, Math.PI * 2);
      }, '#D3D3D3', 2);
      
      // Moon craters
      ctx.fillStyle = '#E6E6FA';
      ctx.beginPath();
      ctx.arc(celestialX - 5, celestialY - 5, 3, 0, Math.PI * 2);
      ctx.arc(celestialX + 7, celestialY + 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Mountains (far background)
    gameState.current.mountains.forEach(mountain => {
      const parallaxX = mountain.x - backgroundOffset * 0.1;
      if (parallaxX > -mountain.width && parallaxX < CANVAS_WIDTH + mountain.width) {
        drawMountain(ctx, { ...mountain, x: parallaxX }, timeOfDay);
      }
    });
    
    // Environment-specific background
    if (environmentType === 'forest') {
      gameState.current.trees.forEach(tree => {
        const parallaxX = tree.x - backgroundOffset * 0.3;
        if (parallaxX > -100 && parallaxX < CANVAS_WIDTH + 100) {
          drawDetailedTree(ctx, { ...tree, x: parallaxX }, timeOfDay);
        }
      });
    } else {
      gameState.current.buildings.forEach(building => {
        const parallaxX = building.x - backgroundOffset * 0.3;
        if (parallaxX > -building.width && parallaxX < CANVAS_WIDTH + building.width) {
          drawBuilding(ctx, { ...building, x: parallaxX }, timeOfDay);
        }
      });
    }
    
    // Ground with outline
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, interpolateColor('#8FBC8F', '#2F4F2F', timeOfDay));
    groundGradient.addColorStop(1, interpolateColor('#228B22', '#1F4F1F', timeOfDay));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    // Ground line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
  };

  const drawTank = (ctx: CanvasRenderingContext2D) => {
    const { tank } = gameState.current;
    
    // Tank body with outline
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
    }, '#000000', 2);
    
    // Tank tracks with outline
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(tank.x - 3, tank.y + tank.height - 8, tank.width + 6, 12);
    }, '#000000', 1);
    
    // Tank turret with outline
    const turretWidth = tank.width * 0.5;
    const turretHeight = tank.height * 0.6;
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(tank.x + (tank.width - turretWidth) / 2, tank.y - turretHeight / 2, turretWidth, turretHeight);
    }, '#000000', 2);
    
    // Tank cannon with outline
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(tank.x + tank.width, tank.y + tank.height / 2 - 3, tank.width * 0.4, 6);
    }, '#000000', 1);
    
    // Tank details
    ctx.fillStyle = '#4FD1C7';
    ctx.fillRect(tank.x + 8, tank.y + 8, 5, 5);
    ctx.fillRect(tank.x + tank.width - 13, tank.y + 8, 5, 5);
    
    // Front armor
    ctx.fillStyle = '#4FD1C7';
    ctx.fillRect(tank.x + tank.width - 5, tank.y + tank.height / 2 - 8, 3, 16);
  };

  const getObstacleSize = (frameCount: number): 'small' | 'medium' | 'large' => {
    if (frameCount < 3000) return 'small';
    if (frameCount < 9000) return Math.random() < 0.7 ? 'small' : 'medium';
    return Math.random() < 0.4 ? 'small' : Math.random() < 0.7 ? 'medium' : 'large';
  };

  const spawnObstacle = () => {
    const { obstacles, frameCount, nextObstacleSpawn, minObstacleSpawnInterval, maxObstacleSpawnInterval } = gameState.current;
    
    if (frameCount > nextObstacleSpawn) {
      const types = ['wall', 'tank', 'jet', 'helicopter', 'infantry', 'lowFlying'];
      const type = types[Math.floor(Math.random() * types.length)];
      const size = getObstacleSize(frameCount);
      
      let width, height, y, isLowFlying = false;
      
      switch (type) {
        case 'wall':
          width = size === 'small' ? 15 : size === 'medium' ? 25 : 35;
          height = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
          y = GROUND_Y - height;
          break;
        case 'tank':
          width = size === 'small' ? 30 : size === 'medium' ? 45 : 60;
          height = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
          y = GROUND_Y - height;
          break;
        case 'jet':
          width = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
          height = size === 'small' ? 15 : size === 'medium' ? 25 : 35;
          // Decreased height significantly - now much lower
          y = size === 'small' ? 200 : size === 'medium' ? 180 : 160;
          break;
        case 'helicopter':
          width = size === 'small' ? 35 : size === 'medium' ? 50 : 70;
          height = size === 'small' ? 25 : size === 'medium' ? 35 : 50;
          // Decreased height significantly - now much lower
          y = size === 'small' ? 220 : size === 'medium' ? 200 : 180;
          break;
        case 'infantry':
          width = size === 'small' ? 20 : size === 'medium' ? 35 : 50;
          height = size === 'small' ? 25 : size === 'medium' ? 35 : 50;
          y = GROUND_Y - height;
          break;
        case 'lowFlying':
          width = size === 'small' ? 50 : size === 'medium' ? 70 : 90;
          height = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
          y = GROUND_Y - 60; // Fixed height for ducking
          isLowFlying = true;
          break;
        default:
          width = 20;
          height = 40;
          y = GROUND_Y - height;
      }
      
      // Improved distance calculation for better gameplay flow
      const baseDistance = 250; // Reduced base distance
      const variableDistance = frameCount < 1800 ? 200 : frameCount < 3600 ? 150 : 100; // More aggressive reduction
      const distance = baseDistance + Math.random() * variableDistance;
      
      const newObstacle: GameObject = {
        x: gameState.current.lastObstacleX + distance,
        y,
        width,
        height,
        type,
        size,
        countedForMissile: false,
        isLowFlying
      };
      
      obstacles.push(newObstacle);
      gameState.current.lastObstacleX = newObstacle.x;
      
      const spawnInterval = minObstacleSpawnInterval + Math.random() * (maxObstacleSpawnInterval - minObstacleSpawnInterval);
      gameState.current.nextObstacleSpawn = frameCount + spawnInterval;
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: GameObject) => {
    const { type, x, y, width, height, size } = obstacle;
    
    switch (type) {
      case 'wall':
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x, y, width, height);
        }, '#000000', 2);
        
        // Brick pattern
        ctx.fillStyle = '#654321';
        for (let i = 0; i < height; i += 20) {
          ctx.fillRect(x, y + i, width, 2);
        }
        break;
        
      case 'tank':
        const tankColor = size === 'small' ? '#8B0000' : size === 'medium' ? '#B22222' : '#DC143C';
        
        // Tank body with outline
        drawWithOutline(ctx, () => {
          ctx.fillStyle = tankColor;
          ctx.fillRect(x, y, width, height);
        }, '#000000', 2);
        
        // Tank tracks
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#2F4F4F';
          ctx.fillRect(x - 2, y + height - 5, width + 4, 8);
        }, '#000000', 1);
        
        // Tank turret
        const turretWidth = width * 0.6;
        const turretHeight = height * 0.6;
        drawWithOutline(ctx, () => {
          ctx.fillStyle = tankColor;
          ctx.fillRect(x + (width - turretWidth) / 2, y - turretHeight / 2, turretWidth, turretHeight);
        }, '#000000', 1);
        
        // Tank cannon (facing left towards player tank)
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#2F4F4F';
          ctx.fillRect(x - width * 0.4, y + height / 2 - 2, width * 0.4, 4);
        }, '#000000', 1);
        break;
        
      case 'jet':
        const jetColor = size === 'small' ? '#4682B4' : size === 'medium' ? '#5F9EA0' : '#6495ED';
        
        // Jet body (facing left)
        drawWithOutline(ctx, () => {
          ctx.fillStyle = jetColor;
          ctx.fillRect(x, y + height / 3, width, height / 3);
        }, '#000000', 2);
        
        // Jet nose (pointing left)
        drawWithOutline(ctx, () => {
          ctx.fillStyle = jetColor;
          ctx.beginPath();
          ctx.moveTo(x, y + height / 2);
          ctx.lineTo(x - 15, y + height / 2);
          ctx.lineTo(x, y + height / 3);
          ctx.lineTo(x, y + 2 * height / 3);
          ctx.closePath();
        }, '#000000', 1);
        
        // Wings
        drawWithOutline(ctx, () => {
          ctx.fillStyle = jetColor;
          ctx.fillRect(x + width / 3, y, width / 3, height);
        }, '#000000', 1);
        
        // Engine exhaust
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x + width, y + height / 2 - 3, 10, 6);
        break;
        
      case 'helicopter':
        const heliColor = size === 'small' ? '#228B22' : size === 'medium' ? '#32CD32' : '#00FF00';
        
        // Helicopter body
        drawWithOutline(ctx, () => {
          ctx.fillStyle = heliColor;
          ctx.fillRect(x, y + height / 4, width, height / 2);
        }, '#000000', 2);
        
        // Main rotor (animated)
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 3;
        const rotorAngle = (gameState.current.frameCount * 0.5) % (Math.PI * 2);
        const rotorLength = width * 0.8;
        ctx.beginPath();
        ctx.moveTo(x + width / 2 - Math.cos(rotorAngle) * rotorLength / 2, y + height / 4);
        ctx.lineTo(x + width / 2 + Math.cos(rotorAngle) * rotorLength / 2, y + height / 4);
        ctx.stroke();
        
        // Tail rotor
        drawWithOutline(ctx, () => {
          ctx.fillStyle = heliColor;
          ctx.fillRect(x - width / 2, y + height / 2, width / 2, height / 6);
        }, '#000000', 1);
        
        // Cockpit
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(x + 5, y + height / 3, width / 3, height / 4);
        }, '#000000', 1);
        break;
        
      case 'infantry':
        const soldierWidth = width / (size === 'small' ? 2 : size === 'medium' ? 3 : 4);
        const soldierCount = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
        
        for (let i = 0; i < soldierCount; i++) {
          const soldierX = x + i * soldierWidth;
          
          // Soldier body
          drawWithOutline(ctx, () => {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(soldierX, y + height * 0.3, soldierWidth * 0.6, height * 0.7);
          }, '#000000', 1);
          
          // Soldier head
          drawWithOutline(ctx, () => {
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(soldierX, y, soldierWidth * 0.6, height * 0.3);
          }, '#000000', 1);
          
          // Weapon (facing left)
          drawWithOutline(ctx, () => {
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(soldierX - soldierWidth * 0.3, y + height * 0.1, soldierWidth * 0.3, 3);
          }, '#000000', 1);
        }
        break;
        
      case 'lowFlying':
        // Low flying drone/missile
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#FF6347';
          ctx.fillRect(x, y, width, height);
        }, '#000000', 2);
        
        // Fins
        drawWithOutline(ctx, () => {
          ctx.fillStyle = '#FF6347';
          ctx.beginPath();
          ctx.moveTo(x + width, y);
          ctx.lineTo(x + width + 10, y - 5);
          ctx.lineTo(x + width + 10, y + height + 5);
          ctx.lineTo(x + width, y + height);
          ctx.closePath();
        }, '#000000', 1);
        
        // Warning stripes
        ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < width; i += 10) {
          ctx.fillRect(x + i, y + height / 2 - 2, 5, 4);
        }
        break;
    }
  };

  const drawMissile = (ctx: CanvasRenderingContext2D, missile: Missile) => {
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(missile.x - 8, missile.y - 2, 16, 4);
    }, '#000000', 1);
    
    // Missile tip
    drawWithOutline(ctx, () => {
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.moveTo(missile.x + 8, missile.y);
      ctx.lineTo(missile.x + 12, missile.y - 2);
      ctx.lineTo(missile.x + 12, missile.y + 2);
      ctx.closePath();
    }, '#000000', 1);
    
    // Exhaust
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(missile.x - 12, missile.y - 1, 4, 2);
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    ctx.save();
    ctx.globalAlpha = explosion.alpha;
    
    const gradient = ctx.createRadialGradient(
      explosion.x, explosion.y, 0,
      explosion.x, explosion.y, explosion.radius
    );
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.3, '#FF4500');
    gradient.addColorStop(0.7, '#FF0000');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Explosion outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    explosion.particles.forEach(particle => {
      ctx.globalAlpha = (particle.life / particle.maxLife) * explosion.alpha;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  };

  const updateMissiles = () => {
    const { missiles, obstacles, explosions } = gameState.current;
    
    missiles.forEach((missile, missileIndex) => {
      if (!missile.active) return;
      
      const dx = missile.targetX - missile.x;
      const dy = missile.targetY - missile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        missile.x += (dx / distance) * missile.speed;
        missile.y += (dy / distance) * missile.speed;
      } else {
        explosions.push({
          x: missile.x,
          y: missile.y,
          radius: 0,
          maxRadius: 50,
          alpha: 1,
          particles: Array.from({ length: 10 }, () => ({
            x: missile.x,
            y: missile.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            maxLife: 30
          }))
        });
        
        obstacles.forEach((obstacle, obstacleIndex) => {
          const dist = Math.sqrt(
            Math.pow(missile.x - (obstacle.x + obstacle.width / 2), 2) +
            Math.pow(missile.y - (obstacle.y + obstacle.height / 2), 2)
          );
          
          if (dist < 60) {
            obstacles.splice(obstacleIndex, 1);
            gameState.current.frameCount += 300;
          }
        });
        
        missile.active = false;
      }
    });
    
    gameState.current.missiles = missiles.filter(missile => missile.active);
  };

  const updateExplosions = () => {
    const { explosions } = gameState.current;
    
    explosions.forEach((explosion, index) => {
      explosion.radius = Math.min(explosion.radius + 2, explosion.maxRadius);
      explosion.alpha = Math.max(0, explosion.alpha - 0.03);
      
      explosion.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.life--;
      });
      
      explosion.particles = explosion.particles.filter(p => p.life > 0);
      
      if (explosion.alpha <= 0) {
        explosions.splice(index, 1);
      }
    });
  };

  const checkCollisions = () => {
    const { tank, obstacles } = gameState.current;
    
    for (const obstacle of obstacles) {
      if (
        tank.x < obstacle.x + obstacle.width &&
        tank.x + tank.width > obstacle.x &&
        tank.y < obstacle.y + obstacle.height &&
        tank.y + tank.height > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  };

  const fireMissile = () => {
    const { tank, obstacles, missiles, missilesReady, lastMissileTime } = gameState.current;
    const currentTime = Date.now();
    
    if (!missilesReady || gameState.current.missileCount === 0 || currentTime - lastMissileTime < 1000) return;
    
    let closestObstacle = null;
    let closestDistance = Infinity;
    
    obstacles.forEach(obstacle => {
      const distance = obstacle.x - tank.x;
      if (distance > 0 && distance < closestDistance) {
        closestDistance = distance;
        closestObstacle = obstacle;
      }
    });
    
    if (closestObstacle) {
      gameState.current.missileCount--;
      missiles.push({
        x: tank.x + tank.width,
        y: tank.y + tank.height / 2,
        targetX: closestObstacle.x + closestObstacle.width / 2,
        targetY: closestObstacle.y + closestObstacle.height / 2,
        speed: 8,
        active: true
      });
      
      gameState.current.lastMissileTime = currentTime;
    }
  };

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { tank, obstacles, keys } = gameState.current;
    
    gameState.current.frameCount++;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update day/night cycle
    gameState.current.dayNightCycle += 0.5;
    gameState.current.timeOfDay = (Math.sin(gameState.current.dayNightCycle * 0.001) + 1) / 2;
    
    // Update background offset for parallax
    gameState.current.backgroundOffset += gameState.current.gameSpeed * 0.5;
    
    // Switch environments periodically
    if (gameState.current.frameCount % 10800 === 0) { // Every 3 minutes
      gameState.current.environmentType = gameState.current.environmentType === 'forest' ? 'urban' : 'forest';
    }
    
    drawBackground(ctx);
    
    // Handle tank physics
    if (keys.space && tank.onGround) {
      tank.velocityY = JUMP_FORCE;
      tank.onGround = false;
    }
    
    tank.velocityY += GRAVITY;
    tank.y += tank.velocityY;
    
    if (tank.y >= GROUND_Y - tank.height) {
      tank.y = GROUND_Y - tank.height;
      tank.velocityY = 0;
      tank.onGround = true;
    }
    
    spawnObstacle();
    
    // Move obstacles at increased speed for better gameplay
    obstacles.forEach((obstacle, index) => {
      obstacle.x -= gameState.current.gameSpeed * 1.2; // Increased obstacle speed by 20%
      
      if (obstacle.x + obstacle.width < tank.x && !obstacle.countedForMissile && gameState.current.missilesReady) {
        gameState.current.dodgedObstaclesCount++;
        obstacle.countedForMissile = true;
        
        if (gameState.current.dodgedObstaclesCount >= MISSILES_TO_GAIN_ONE) {
          if (gameState.current.missileCount < MAX_MISSILES) {
            gameState.current.missileCount++;
          }
          gameState.current.dodgedObstaclesCount = 0;
        }
      }
      
      if (obstacle.x + obstacle.width < 0) {
        obstacles.splice(index, 1);
      }
    });
    
    updateMissiles();
    updateExplosions();
    
    if (checkCollisions()) {
      setGameOver(true);
      if (Math.floor(gameState.current.frameCount / 6) > highScore) {
        const newHighScore = Math.floor(gameState.current.frameCount / 6);
        setHighScore(newHighScore);
        localStorage.setItem('tankGameHighScore', newHighScore.toString());
      }
      return;
    }
    
    // Improved speed progression
    const newSpeed = initialSpeed + Math.floor(gameState.current.frameCount / 1200) * 0.4; // Faster progression
    gameState.current.gameSpeed = Math.min(newSpeed, MAX_GAME_SPEED);
    setGameSpeed(gameState.current.gameSpeed);
    
    if (gameState.current.frameCount > 0 && gameState.current.frameCount % 4800 === 0) { // Every 80 seconds
      gameState.current.minObstacleSpawnInterval = Math.max(OBSTACLE_SPAWN_MIN, gameState.current.minObstacleSpawnInterval - OBSTACLE_SPAWN_DECREASE_RATE);
      gameState.current.maxObstacleSpawnInterval = Math.max(OBSTACLE_SPAWN_MIN, gameState.current.maxObstacleSpawnInterval - OBSTACLE_SPAWN_DECREASE_RATE * 2);
    }
    
    if (Math.floor(gameState.current.frameCount / 6) >= MISSILE_ACTIVATION_SCORE && !gameState.current.missilesReady) {
      gameState.current.missilesReady = true;
    }
    
    const currentScore = Math.floor(gameState.current.frameCount / 6);
    setScore(currentScore);
    
    drawTank(ctx);
    obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));
    gameState.current.missiles.forEach(missile => drawMissile(ctx, missile));
    gameState.current.explosions.forEach(explosion => drawExplosion(ctx, explosion));
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, gameStarted, initialSpeed, highScore]);

  const resetGame = () => {
    gameState.current = {
      tank: { x: 100, y: 280, width: 60, height: 40, velocityY: 0, onGround: true },
      obstacles: [],
      missiles: [],
      explosions: [],
      trees: gameState.current.trees,
      buildings: gameState.current.buildings,
      mountains: gameState.current.mountains,
      lastObstacleX: CANVAS_WIDTH,
      keys: { space: false, up: false },
      gameSpeed: initialSpeed,
      frameCount: 0,
      timeOfDay: 0,
      dayNightCycle: 0,
      backgroundOffset: 0,
      missileUnlocked: false,
      lastMissileTime: 0,
      missileTarget: null,
      nextObstacleSpawn: 0,
      minObstacleSpawnInterval: 60,
      maxObstacleSpawnInterval: 180,
      missileCount: 0,
      dodgedObstaclesCount: 0,
      missilesReady: false,
      sunMoonPosition: { x: 200, y: 80 },
      environmentType: 'forest',
      environmentTransition: 0
    };
    setScore(0);
    setGameOver(false);
    setGameSpeed(initialSpeed);
    setGameStarted(true);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const startGame = () => {
    setGameStarted(true);
    setShowSettings(false);
  };

  useEffect(() => {
    initializeBackground();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        gameState.current.keys.space = true;
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        gameState.current.keys.up = true;
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
      if (e.code === 'KeyF') {
        e.preventDefault();
        fireMissile();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        gameState.current.keys.space = false;
      }
      if (e.code === 'ArrowUp') {
        gameState.current.keys.up = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (!gameOver && !isPaused && gameStarted) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameOver, isPaused, gameStarted, initializeBackground]);

  // Show landscape mode requirement for mobile devices in portrait mode
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white p-8 max-w-md mx-4">
          {/* Animated rotation icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-16 border-4 border-sky-400 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-sky-400 font-bold text-xs">PHONE</span>
              </div>
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                <RotateCw className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Rotate Your Device
            </span>
          </h2>
          
          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-xl text-gray-300">
              For the best tank combat experience, please rotate your device to 
              <span className="text-sky-400 font-bold"> landscape mode</span>.
            </p>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                🎮 Landscape mode provides:
              </p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                <li>• Better visibility of obstacles</li>
                <li>• Improved touch controls</li>
                <li>• Enhanced gameplay experience</li>
              </ul>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 border border-gray-500 rounded"></div>
              <span>→</span>
              <div className="w-4 h-6 border border-sky-400 rounded"></div>
            </div>
            <span>Turn sideways</span>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <X className="w-5 h-5" />
            <span>Exit Game</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-sky-400 rounded-lg game-canvas"
        />
        
        {/* Game UI Overlay - Horizontal Layout */}
        <div className="absolute top-4 left-4 text-white font-orbitron">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-6">
              <div>Score: <span className="text-sky-400 font-bold">{score}</span></div>
              <div>High Score: <span className="text-emerald-400 font-bold">{highScore}</span></div>
              <div>Speed: <span className="text-orange-400 font-bold">{gameSpeed.toFixed(1)}x</span></div>
              {gameState.current.missilesReady && (
                <div className="text-red-400 font-bold">🚀 MISSILES: {gameState.current.missileCount}</div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={togglePause}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Key Legend - Top Right */}
        <div className="absolute top-16 right-4 text-white font-rajdhani">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm space-y-1">
              <div><span className="text-sky-400">SPACE</span> - Jump</div>
              <div><span className="text-sky-400">F</span> - Fire Missile</div>
              <div><span className="text-sky-400">P</span> - Pause</div>
            </div>
          </div>
        </div>

        {/* Fire Missile Button */}
        {gameState.current.missilesReady && gameState.current.missileCount > 0 && gameStarted && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={fireMissile}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>FIRE</span>
            </button>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-gray-900 border-2 border-sky-500 rounded-xl p-6 text-white font-orbitron min-w-80">
            <h3 className="text-xl font-bold text-sky-400 mb-4">Game Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Speed: <span className="text-sky-400 font-bold">{initialSpeed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="6.0"
                  step="0.1"
                  value={initialSpeed}
                  onChange={(e) => setInitialSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((initialSpeed - 3) / 3) * 100}%, #374151 ${((initialSpeed - 3) / 3) * 100}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3.0x</span>
                  <span>4.5x</span>
                  <span>6.0x</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>• Game speed will increase up to {MAX_GAME_SPEED}x as you progress</p>
                <p>• Higher initial speed = more challenging start</p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Start Game
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Game Screen */}
        {!gameStarted && !showSettings && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border-2 border-sky-500 rounded-xl p-8 text-center max-w-md">
              <h2 className="text-3xl font-orbitron font-bold text-sky-400 mb-6">Vanguard Velocity</h2>
              <p className="text-white mb-6">Configure your tank and prepare for battle!</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Quick Start</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-8 text-center max-w-md">
              <h2 className="text-3xl font-orbitron font-bold text-red-400 mb-4">GAME OVER</h2>
              <div className="space-y-2 mb-6 text-white">
                <div>Final Score: <span className="text-sky-400 font-bold">{score}</span></div>
                <div>High Score: <span className="text-emerald-400 font-bold">{highScore}</span></div>
                {score > highScore && (
                  <div className="text-yellow-400 font-bold">🎉 NEW HIGH SCORE! 🎉</div>
                )}
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pause Screen */}
        {isPaused && !gameOver && gameStarted && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border-2 border-sky-500 rounded-xl p-8 text-center">
              <h2 className="text-3xl font-orbitron font-bold text-sky-400 mb-4">PAUSED</h2>
              <p className="text-white mb-6">Press P to resume or click the play button</p>
              <button
                onClick={togglePause}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;