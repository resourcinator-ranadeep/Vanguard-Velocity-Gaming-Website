import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, RotateCcw, Pause, Play, RotateCw, Smartphone } from 'lucide-react';

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

interface SciFiStructure {
  x: number;
  y: number;
  height: number;
  width: number;
  type: 'crystal' | 'tower' | 'dome' | 'spire';
  glowPhase: number;
  energyNodes: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
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
  const [gameSpeed, setGameSpeed] = useState(3.0);
  const [initialSpeed, setInitialSpeed] = useState(3.0);
  const [showSpeedSelector, setShowSpeedSelector] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  // Mobile detection and orientation checking
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768 && 'ontouchstart' in window;
      return isMobileDevice || isSmallScreen;
    };

    const checkOrientation = () => {
      return window.innerWidth > window.innerHeight;
    };

    const updateMobileState = () => {
      setIsMobile(checkMobile());
      setIsLandscape(checkOrientation());
    };

    updateMobileState();

    const handleResize = () => {
      setTimeout(updateMobileState, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(updateMobileState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Game state
  const gameState = useRef({
    tank: { x: 100, y: 280, width: 60, height: 40, velocityY: 0, onGround: true },
    obstacles: [] as GameObject[],
    missiles: [] as Missile[],
    explosions: [] as Explosion[],
    sciFiStructures: [] as SciFiStructure[],
    lastObstacleX: 0,
    keys: { space: false, up: false },
    gameSpeed: 3.0,
    frameCount: 0,
    timeOfDay: 0,
    dayNightCycle: 0,
    backgroundOffset: 0,
    missileUnlocked: false,
    lastMissileTime: 0,
    missileTarget: null as GameObject | null,
    nextObstacleSpawn: 0,
    minObstacleSpawnInterval: 60,
    maxObstacleSpawnInterval: 180,
    missileCount: 0,
    dodgedObstaclesCount: 0,
    missilesReady: false
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
  const OBSTACLE_SPAWN_MIN = 40;

  // Initialize sci-fi structures for background
  const initializeSciFiStructures = useCallback(() => {
    const structures: SciFiStructure[] = [];
    for (let i = 0; i < 25; i++) {
      const types: Array<'crystal' | 'tower' | 'dome' | 'spire'> = ['crystal', 'tower', 'dome', 'spire'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const baseHeight = type === 'spire' ? 100 : type === 'tower' ? 80 : 60;
      const height = baseHeight + Math.random() * 50;
      const width = type === 'crystal' ? 20 + Math.random() * 15 : 25 + Math.random() * 20;
      
      const structure: SciFiStructure = {
        x: i * 150 + Math.random() * 60,
        y: GROUND_Y - height,
        height,
        width,
        type,
        glowPhase: Math.random() * Math.PI * 2,
        energyNodes: []
      };

      // Generate energy nodes
      const nodeCount = 3 + Math.random() * 4;
      for (let j = 0; j < nodeCount; j++) {
        const colors = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF6600'];
        structure.energyNodes.push({
          x: structure.x + Math.random() * structure.width,
          y: structure.y + Math.random() * structure.height,
          size: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      structures.push(structure);
    }
    gameState.current.sciFiStructures = structures;
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

  const drawSciFiStructure = (ctx: CanvasRenderingContext2D, structure: SciFiStructure, timeOfDay: number) => {
    const { x, y, height, width, type, glowPhase, energyNodes } = structure;
    
    // Update glow phase
    structure.glowPhase += 0.02;
    
    const baseColors = {
      crystal: { day: '#4A90E2', night: '#00FFFF' },
      tower: { day: '#7B68EE', night: '#FF00FF' },
      dome: { day: '#32CD32', night: '#00FF00' },
      spire: { day: '#FF6347', night: '#FF4500' }
    };
    
    const structureColor = interpolateColor(
      baseColors[type].day,
      baseColors[type].night,
      timeOfDay
    );
    
    // Draw structure based on type
    ctx.save();
    
    switch (type) {
      case 'crystal':
        // Crystal formation
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, structureColor);
        gradient.addColorStop(0.5, interpolateColor(structureColor, '#FFFFFF', 0.3));
        gradient.addColorStop(1, interpolateColor(structureColor, '#000000', 0.3));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height * 0.7);
        ctx.lineTo(x + width * 0.8, y + height);
        ctx.lineTo(x + width * 0.2, y + height);
        ctx.lineTo(x, y + height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // Crystal facets
        ctx.strokeStyle = interpolateColor(structureColor, '#FFFFFF', 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width / 2, y + height);
        ctx.moveTo(x, y + height * 0.7);
        ctx.lineTo(x + width, y + height * 0.7);
        ctx.stroke();
        break;
        
      case 'tower':
        // Futuristic tower
        const towerGradient = ctx.createLinearGradient(x, y, x + width, y);
        towerGradient.addColorStop(0, interpolateColor(structureColor, '#000000', 0.3));
        towerGradient.addColorStop(0.5, structureColor);
        towerGradient.addColorStop(1, interpolateColor(structureColor, '#000000', 0.3));
        
        ctx.fillStyle = towerGradient;
        ctx.fillRect(x, y, width, height);
        
        // Tower segments
        for (let i = 0; i < 5; i++) {
          const segmentY = y + (i / 5) * height;
          ctx.strokeStyle = interpolateColor(structureColor, '#FFFFFF', 0.4);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, segmentY);
          ctx.lineTo(x + width, segmentY);
          ctx.stroke();
        }
        break;
        
      case 'dome':
        // Energy dome
        const domeGradient = ctx.createRadialGradient(
          x + width / 2, y + height, 0,
          x + width / 2, y + height, width / 2
        );
        domeGradient.addColorStop(0, interpolateColor(structureColor, '#FFFFFF', 0.3));
        domeGradient.addColorStop(0.7, structureColor);
        domeGradient.addColorStop(1, interpolateColor(structureColor, '#000000', 0.5));
        
        ctx.fillStyle = domeGradient;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height, width / 2, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        
        // Dome grid
        ctx.strokeStyle = interpolateColor(structureColor, '#FFFFFF', 0.3);
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height, (width / 2) * (i / 4), Math.PI, 0);
          ctx.stroke();
        }
        break;
        
      case 'spire':
        // Energy spire
        const spireGradient = ctx.createLinearGradient(x, y, x, y + height);
        spireGradient.addColorStop(0, interpolateColor(structureColor, '#FFFFFF', 0.5));
        spireGradient.addColorStop(0.5, structureColor);
        spireGradient.addColorStop(1, interpolateColor(structureColor, '#000000', 0.3));
        
        ctx.fillStyle = spireGradient;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width * 0.8, y + height * 0.3);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width * 0.2, y + height * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    // Draw energy nodes with glow
    energyNodes.forEach(node => {
      const glowIntensity = 0.5 + 0.5 * Math.sin(glowPhase + node.x * 0.01);
      
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 10 * glowIntensity;
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.8 + 0.2 * glowIntensity;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * glowIntensity, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
    
    ctx.restore();
  };

  const drawSciFiBackground = (ctx: CanvasRenderingContext2D) => {
    const { timeOfDay, backgroundOffset } = gameState.current;
    
    // Sci-fi sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    const dayTopColor = '#1a1a2e';
    const dayBottomColor = '#16213e';
    const nightTopColor = '#0f0f23';
    const nightBottomColor = '#16213e';
    
    const topColor = interpolateColor(dayTopColor, nightTopColor, timeOfDay);
    const bottomColor = interpolateColor(dayBottomColor, nightBottomColor, timeOfDay);
    
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Sci-fi stars/energy particles
    ctx.fillStyle = timeOfDay > 0.3 ? '#00FFFF' : '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 47) % CANVAS_WIDTH;
      const y = (i * 23) % (CANVAS_HEIGHT * 0.6);
      const twinkle = 0.3 + 0.7 * Math.sin(gameState.current.frameCount * 0.02 + i);
      ctx.globalAlpha = twinkle * (timeOfDay > 0.3 ? 1 : 0.5);
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    
    // Sci-fi sun/energy core
    const celestialX = 200 + Math.cos(gameState.current.dayNightCycle * 0.01) * 400;
    const celestialY = 80 + Math.sin(gameState.current.dayNightCycle * 0.01) * 30;
    
    if (timeOfDay < 0.5) {
      // Energy sun
      const sunGradient = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, 30);
      sunGradient.addColorStop(0, '#FFFF00');
      sunGradient.addColorStop(0.3, '#FF6600');
      sunGradient.addColorStop(0.7, '#FF0066');
      sunGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Energy rays
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + gameState.current.frameCount * 0.01;
        const rayLength = 15 + 5 * Math.sin(gameState.current.frameCount * 0.05 + i);
        ctx.beginPath();
        ctx.moveTo(
          celestialX + Math.cos(angle) * 35,
          celestialY + Math.sin(angle) * 35
        );
        ctx.lineTo(
          celestialX + Math.cos(angle) * (35 + rayLength),
          celestialY + Math.sin(angle) * (35 + rayLength)
        );
        ctx.stroke();
      }
    } else {
      // Energy moon
      const moonGradient = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, 25);
      moonGradient.addColorStop(0, '#00FFFF');
      moonGradient.addColorStop(0.7, '#0066FF');
      moonGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon energy rings
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 25 + i * 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    
    // Sci-fi mountains/alien landscape
    ctx.fillStyle = interpolateColor('#2D1B69', '#1A1A2E', timeOfDay);
    ctx.beginPath();
    ctx.moveTo(-50, GROUND_Y);
    // Create angular, crystalline mountain shapes
    ctx.lineTo(80, GROUND_Y - 90);
    ctx.lineTo(150, GROUND_Y - 70);
    ctx.lineTo(220, GROUND_Y - 110);
    ctx.lineTo(300, GROUND_Y - 85);
    ctx.lineTo(380, GROUND_Y - 120);
    ctx.lineTo(460, GROUND_Y - 95);
    ctx.lineTo(540, GROUND_Y - 130);
    ctx.lineTo(620, GROUND_Y - 100);
    ctx.lineTo(700, GROUND_Y - 115);
    ctx.lineTo(780, GROUND_Y - 80);
    ctx.lineTo(860, GROUND_Y - 125);
    ctx.lineTo(940, GROUND_Y - 90);
    ctx.lineTo(1020, GROUND_Y - 105);
    ctx.lineTo(1100, GROUND_Y - 75);
    ctx.lineTo(CANVAS_WIDTH + 50, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    
    // Mountain energy veins
    ctx.strokeStyle = interpolateColor('#00FFFF', '#FF00FF', timeOfDay);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 10; i++) {
      const x = i * 120;
      const y = GROUND_Y - 50 - Math.random() * 60;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 50 + Math.random() * 30, y - 20 - Math.random() * 20);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Sci-fi structures in background with parallax
    gameState.current.sciFiStructures.forEach(structure => {
      const parallaxX = structure.x - backgroundOffset * 0.3;
      if (parallaxX > -100 && parallaxX < CANVAS_WIDTH + 100) {
        drawSciFiStructure(ctx, { ...structure, x: parallaxX }, timeOfDay);
      }
    });
    
    // Sci-fi ground with energy grid
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, interpolateColor('#1A1A2E', '#0F0F23', timeOfDay));
    groundGradient.addColorStop(1, interpolateColor('#16213E', '#1A1A2E', timeOfDay));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    // Energy grid on ground
    ctx.strokeStyle = interpolateColor('#00FFFF', '#FF00FF', timeOfDay);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Horizontal grid lines
    for (let i = 0; i < 3; i++) {
      const y = GROUND_Y + 10 + i * 15;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Vertical grid lines with parallax
    for (let i = 0; i < 20; i++) {
      const x = (i * 60 - backgroundOffset * 0.5) % (CANVAS_WIDTH + 60);
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawSciFiTank = (ctx: CanvasRenderingContext2D) => {
    const { tank } = gameState.current;
    
    // Sci-fi tank body with energy core
    const bodyGradient = ctx.createLinearGradient(tank.x, tank.y, tank.x + tank.width, tank.y + tank.height);
    bodyGradient.addColorStop(0, '#2D3748');
    bodyGradient.addColorStop(0.5, '#4A5568');
    bodyGradient.addColorStop(1, '#1A202C');
    
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
    
    // Energy outline
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(tank.x, tank.y, tank.width, tank.height);
    
    // Sci-fi tracks with energy
    const trackGradient = ctx.createLinearGradient(tank.x - 3, tank.y + tank.height - 8, tank.x + tank.width + 6, tank.y + tank.height + 4);
    trackGradient.addColorStop(0, '#1A202C');
    trackGradient.addColorStop(0.5, '#2D3748');
    trackGradient.addColorStop(1, '#1A202C');
    
    ctx.fillStyle = trackGradient;
    ctx.fillRect(tank.x - 3, tank.y + tank.height - 8, tank.width + 6, 12);
    
    // Energy track lines
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tank.x - 3, tank.y + tank.height - 2);
    ctx.lineTo(tank.x + tank.width + 3, tank.y + tank.height - 2);
    ctx.moveTo(tank.x - 3, tank.y + tank.height + 2);
    ctx.lineTo(tank.x + tank.width + 3, tank.y + tank.height + 2);
    ctx.stroke();
    
    // Sci-fi turret with energy core
    const turretWidth = tank.width * 0.5;
    const turretHeight = tank.height * 0.6;
    const turretGradient = ctx.createRadialGradient(
      tank.x + (tank.width - turretWidth) / 2 + turretWidth / 2,
      tank.y - turretHeight / 2 + turretHeight / 2,
      0,
      tank.x + (tank.width - turretWidth) / 2 + turretWidth / 2,
      tank.y - turretHeight / 2 + turretHeight / 2,
      turretWidth / 2
    );
    turretGradient.addColorStop(0, '#4A5568');
    turretGradient.addColorStop(0.7, '#2D3748');
    turretGradient.addColorStop(1, '#1A202C');
    
    ctx.fillStyle = turretGradient;
    ctx.fillRect(tank.x + (tank.width - turretWidth) / 2, tank.y - turretHeight / 2, turretWidth, turretHeight);
    
    // Turret energy outline
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(tank.x + (tank.width - turretWidth) / 2, tank.y - turretHeight / 2, turretWidth, turretHeight);
    
    // Sci-fi cannon with energy beam
    const cannonGradient = ctx.createLinearGradient(tank.x + tank.width, tank.y + tank.height / 2 - 3, tank.x + tank.width + tank.width * 0.4, tank.y + tank.height / 2 + 3);
    cannonGradient.addColorStop(0, '#2D3748');
    cannonGradient.addColorStop(0.5, '#4A5568');
    cannonGradient.addColorStop(1, '#00FFFF');
    
    ctx.fillStyle = cannonGradient;
    ctx.fillRect(tank.x + tank.width, tank.y + tank.height / 2 - 3, tank.width * 0.4, 6);
    
    // Cannon energy outline
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(tank.x + tank.width, tank.y + tank.height / 2 - 3, tank.width * 0.4, 6);
    
    // Energy core in center
    const coreX = tank.x + tank.width / 2;
    const coreY = tank.y + tank.height / 2;
    const coreGlow = 0.5 + 0.5 * Math.sin(gameState.current.frameCount * 0.1);
    
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 10 * coreGlow;
    ctx.fillStyle = '#00FFFF';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(coreX, coreY, 3 * coreGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    
    // Energy details
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(tank.x + 8, tank.y + 8, 5, 5);
    ctx.fillRect(tank.x + tank.width - 13, tank.y + 8, 5, 5);
    
    // Additional sci-fi details
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(tank.x + 5, tank.y + tank.height - 15, 3, 10);
    ctx.fillRect(tank.x + tank.width - 8, tank.y + tank.height - 15, 3, 10);
    
    // Front energy shield
    const shieldGradient = ctx.createLinearGradient(tank.x + tank.width - 5, tank.y + tank.height / 2 - 8, tank.x + tank.width - 2, tank.y + tank.height / 2 + 8);
    shieldGradient.addColorStop(0, '#00FFFF');
    shieldGradient.addColorStop(0.5, '#FF00FF');
    shieldGradient.addColorStop(1, '#00FFFF');
    
    ctx.fillStyle = shieldGradient;
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
      const types = ['wall', 'tank', 'jet', 'helicopter', 'infantry'];
      const type = types[Math.floor(Math.random() * types.length)];
      const size = getObstacleSize(frameCount);
      
      let width, height, y;
      
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
          y = size === 'small' ? 150 : size === 'medium' ? 130 : 110;
          break;
        case 'helicopter':
          width = size === 'small' ? 35 : size === 'medium' ? 50 : 70;
          height = size === 'small' ? 25 : size === 'medium' ? 35 : 50;
          y = size === 'small' ? 170 : size === 'medium' ? 150 : 130;
          break;
        case 'infantry':
          width = size === 'small' ? 20 : size === 'medium' ? 35 : 50;
          height = size === 'small' ? 25 : size === 'medium' ? 35 : 50;
          y = GROUND_Y - height;
          break;
        default:
          width = 20;
          height = 40;
          y = GROUND_Y - height;
      }
      
      const minDistance = 200 + (frameCount < 3000 ? 150 : frameCount < 6000 ? 100 : 50);
      const maxDistance = 350 + (frameCount < 3000 ? 200 : frameCount < 6000 ? 150 : 100);
      const distance = minDistance + Math.random() * (maxDistance - minDistance);
      
      const newObstacle: GameObject = {
        x: gameState.current.lastObstacleX + distance,
        y,
        width,
        height,
        type,
        size,
        countedForMissile: false
      };
      
      obstacles.push(newObstacle);
      gameState.current.lastObstacleX = newObstacle.x;
      
      const spawnInterval = minObstacleSpawnInterval + Math.random() * (maxObstacleSpawnInterval - minObstacleSpawnInterval);
      gameState.current.nextObstacleSpawn = frameCount + spawnInterval;
    }
  };

  const drawSciFiObstacle = (ctx: CanvasRenderingContext2D, obstacle: GameObject) => {
    const { type, x, y, width, height, size } = obstacle;
    const glowPhase = gameState.current.frameCount * 0.05;
    
    switch (type) {
      case 'wall':
        // Sci-fi energy barrier
        const wallGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        wallGradient.addColorStop(0, '#FF00FF');
        wallGradient.addColorStop(0.5, '#00FFFF');
        wallGradient.addColorStop(1, '#FF00FF');
        
        ctx.fillStyle = wallGradient;
        ctx.fillRect(x, y, width, height);
        
        // Energy field lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < height; i += 10) {
          const offset = 2 * Math.sin(glowPhase + i * 0.1);
          ctx.beginPath();
          ctx.moveTo(x + offset, y + i);
          ctx.lineTo(x + width + offset, y + i);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Energy outline
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        break;
        
      case 'tank':
        // Sci-fi enemy tank
        const enemyTankGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        enemyTankGradient.addColorStop(0, size === 'small' ? '#8B0000' : size === 'medium' ? '#B22222' : '#DC143C');
        enemyTankGradient.addColorStop(0.5, '#FF0000');
        enemyTankGradient.addColorStop(1, size === 'small' ? '#8B0000' : size === 'medium' ? '#B22222' : '#DC143C');
        
        ctx.fillStyle = enemyTankGradient;
        ctx.fillRect(x, y, width, height);
        
        // Energy outline
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Sci-fi tracks
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(x - 2, y + height - 5, width + 4, 8);
        
        // Enemy turret
        const enemyTurretWidth = width * 0.6;
        const enemyTurretHeight = height * 0.6;
        ctx.fillStyle = size === 'small' ? '#8B0000' : size === 'medium' ? '#B22222' : '#DC143C';
        ctx.fillRect(x + (width - enemyTurretWidth) / 2, y - enemyTurretHeight / 2, enemyTurretWidth, enemyTurretHeight);
        
        // Enemy cannon facing left (toward player tank)
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(x - width * 0.4, y + height / 2 - 2, width * 0.4, 4);
        
        // Enemy energy core
        const enemyCoreGlow = 0.5 + 0.5 * Math.sin(glowPhase);
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 8 * enemyCoreGlow;
        ctx.fillStyle = '#FF0000';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, 2 * enemyCoreGlow, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        break;
        
      case 'jet':
        // Sci-fi fighter jet
        const jetGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        jetGradient.addColorStop(0, size === 'small' ? '#4682B4' : size === 'medium' ? '#5F9EA0' : '#6495ED');
        jetGradient.addColorStop(0.5, '#00FFFF');
        jetGradient.addColorStop(1, size === 'small' ? '#4682B4' : size === 'medium' ? '#5F9EA0' : '#6495ED');
        
        // Main body
        ctx.fillStyle = jetGradient;
        ctx.fillRect(x, y + height / 3, width, height / 3);
        
        // Jet nose (pointing left toward tank)
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x - 15, y + height / 2);
        ctx.lineTo(x, y + height / 3);
        ctx.lineTo(x, y + 2 * height / 3);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillRect(x + width / 3, y, width / 3, height);
        
        // Energy thrusters
        const thrusterGlow = 0.5 + 0.5 * Math.sin(glowPhase * 2);
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10 * thrusterGlow;
        ctx.fillStyle = '#00FFFF';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x + width, y + height / 2 - 2, 8, 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Jet outline
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + height / 3, width, height / 3);
        break;
        
      case 'helicopter':
        // Sci-fi hover craft
        const heliGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        heliGradient.addColorStop(0, size === 'small' ? '#228B22' : size === 'medium' ? '#32CD32' : '#00FF00');
        heliGradient.addColorStop(0.5, '#00FFFF');
        heliGradient.addColorStop(1, size === 'small' ? '#228B22' : size === 'medium' ? '#32CD32' : '#00FF00');
        
        // Main body
        ctx.fillStyle = heliGradient;
        ctx.fillRect(x, y + height / 4, width, height / 2);
        
        // Energy rotor (spinning effect)
        const rotorAngle = glowPhase * 10;
        ctx.save();
        ctx.translate(x + width / 2, y + height / 4);
        ctx.rotate(rotorAngle);
        
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(-width / 2 - 10, 0);
        ctx.lineTo(width / 2 + 10, 0);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Hover energy field
        const hoverGlow = 0.3 + 0.3 * Math.sin(glowPhase);
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 15 * hoverGlow;
        ctx.fillStyle = '#00FF00';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x - 5, y + height, width + 10, 5);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Cockpit
        ctx.fillStyle = size === 'small' ? '#228B22' : size === 'medium' ? '#32CD32' : '#00FF00';
        ctx.fillRect(x - width / 2, y + height / 2, width / 2, height / 6);
        break;
        
      case 'infantry':
        // Sci-fi robot soldiers
        const soldierWidth = width / (size === 'small' ? 2 : size === 'medium' ? 3 : 4);
        const soldierCount = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
        
        for (let i = 0; i < soldierCount; i++) {
          const soldierX = x + i * soldierWidth;
          
          // Robot body
          const robotGradient = ctx.createLinearGradient(soldierX, y, soldierX + soldierWidth, y + height);
          robotGradient.addColorStop(0, '#4A5568');
          robotGradient.addColorStop(0.5, '#2D3748');
          robotGradient.addColorStop(1, '#1A202C');
          
          ctx.fillStyle = robotGradient;
          ctx.fillRect(soldierX, y + height * 0.3, soldierWidth * 0.6, height * 0.7);
          
          // Robot head
          ctx.fillStyle = '#4A5568';
          ctx.fillRect(soldierX, y, soldierWidth * 0.6, height * 0.3);
          
          // Energy weapon
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(soldierX + soldierWidth * 0.6, y + height * 0.1, soldierWidth * 0.3, 3);
          
          // Robot eyes
          const eyeGlow = 0.5 + 0.5 * Math.sin(glowPhase + i);
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 5 * eyeGlow;
          ctx.fillStyle = '#FF0000';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(soldierX + 2, y + 5, 2, 2);
          ctx.fillRect(soldierX + 6, y + 5, 2, 2);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          
          // Energy outline
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 1;
          ctx.strokeRect(soldierX, y, soldierWidth * 0.6, height);
        }
        break;
    }
  };

  const drawSciFiMissile = (ctx: CanvasRenderingContext2D, missile: Missile) => {
    // Sci-fi missile with energy trail
    const missileGradient = ctx.createLinearGradient(missile.x - 8, missile.y - 2, missile.x + 8, missile.y + 2);
    missileGradient.addColorStop(0, '#FF4500');
    missileGradient.addColorStop(0.5, '#FFFF00');
    missileGradient.addColorStop(1, '#FF0000');
    
    ctx.fillStyle = missileGradient;
    ctx.fillRect(missile.x - 8, missile.y - 2, 16, 4);
    
    // Energy nose
    ctx.beginPath();
    ctx.moveTo(missile.x + 8, missile.y);
    ctx.lineTo(missile.x + 12, missile.y - 2);
    ctx.lineTo(missile.x + 12, missile.y + 2);
    ctx.closePath();
    ctx.fill();
    
    // Energy trail
    const trailGradient = ctx.createLinearGradient(missile.x - 12, missile.y - 1, missile.x - 20, missile.y + 1);
    trailGradient.addColorStop(0, '#FFFF00');
    trailGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = trailGradient;
    ctx.fillRect(missile.x - 20, missile.y - 1, 8, 2);
    
    // Energy glow
    const glowIntensity = 0.5 + 0.5 * Math.sin(gameState.current.frameCount * 0.2);
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 10 * glowIntensity;
    ctx.fillStyle = '#FFFF00';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(missile.x - 8, missile.y - 2, 16, 4);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  };

  const drawSciFiExplosion = (ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    ctx.save();
    ctx.globalAlpha = explosion.alpha;
    
    // Sci-fi explosion with energy rings
    const gradient = ctx.createRadialGradient(
      explosion.x, explosion.y, 0,
      explosion.x, explosion.y, explosion.radius
    );
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.2, '#FFFF00');
    gradient.addColorStop(0.4, '#FF6600');
    gradient.addColorStop(0.6, '#FF0000');
    gradient.addColorStop(0.8, '#FF00FF');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy rings
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.globalAlpha = explosion.alpha * 0.7;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius * (i / 3), 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Energy particles
    explosion.particles.forEach(particle => {
      ctx.globalAlpha = (particle.life / particle.maxLife) * explosion.alpha;
      
      // Particle glow
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
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
          particles: Array.from({ length: 15 }, () => ({
            x: missile.x,
            y: missile.y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 40,
            maxLife: 40
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
        speed: 10,
        active: true
      });
      
      gameState.current.lastMissileTime = currentTime;
    }
  };

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { tank, obstacles, keys } = gameState.current;
    
    gameState.current.frameCount++;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    gameState.current.dayNightCycle += 0.5;
    gameState.current.timeOfDay = (Math.sin(gameState.current.dayNightCycle * 0.001) + 1) / 2;
    
    gameState.current.backgroundOffset += gameState.current.gameSpeed * 0.5;
    
    drawSciFiBackground(ctx);
    
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
    
    obstacles.forEach((obstacle, index) => {
      obstacle.x -= gameState.current.gameSpeed;
      
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
    
    const newSpeed = Math.min(initialSpeed + Math.floor(gameState.current.frameCount / 1800) * 0.5, 10);
    gameState.current.gameSpeed = newSpeed;
    setGameSpeed(newSpeed);
    
    if (gameState.current.frameCount > 0 && gameState.current.frameCount % 6000 === 0) {
      gameState.current.minObstacleSpawnInterval = Math.max(OBSTACLE_SPAWN_MIN, gameState.current.minObstacleSpawnInterval - OBSTACLE_SPAWN_DECREASE_RATE);
      gameState.current.maxObstacleSpawnInterval = Math.max(OBSTACLE_SPAWN_MIN, gameState.current.maxObstacleSpawnInterval - OBSTACLE_SPAWN_DECREASE_RATE * 2);
    }
    
    if (Math.floor(gameState.current.frameCount / 6) >= MISSILE_ACTIVATION_SCORE && !gameState.current.missilesReady) {
      gameState.current.missilesReady = true;
    }
    
    const currentScore = Math.floor(gameState.current.frameCount / 6);
    setScore(currentScore);
    
    drawSciFiTank(ctx);
    obstacles.forEach(obstacle => drawSciFiObstacle(ctx, obstacle));
    gameState.current.missiles.forEach(missile => drawSciFiMissile(ctx, missile));
    gameState.current.explosions.forEach(explosion => drawSciFiExplosion(ctx, explosion));
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, highScore, initialSpeed]);

  const resetGame = () => {
    gameState.current = {
      tank: { x: 100, y: 280, width: 60, height: 40, velocityY: 0, onGround: true },
      obstacles: [],
      missiles: [],
      explosions: [],
      sciFiStructures: gameState.current.sciFiStructures,
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
      missilesReady: false
    };
    setScore(0);
    setGameOver(false);
    setGameSpeed(initialSpeed);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const startGame = () => {
    gameState.current.gameSpeed = initialSpeed;
    setGameSpeed(initialSpeed);
    setShowSpeedSelector(false);
    resetGame();
  };

  useEffect(() => {
    initializeSciFiStructures();
    
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

    if (!gameOver && !isPaused && !showSpeedSelector) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameOver, isPaused, showSpeedSelector, initializeSciFiStructures]);

  // Show landscape mode requirement for mobile
  if (isMobile && !isLandscape) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm border-2 border-sky-500 rounded-2xl p-8 max-w-md text-center">
          {/* Animated phone rotation icon */}
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-sky-400" />
              <RotateCw className="w-8 h-8 text-emerald-400 absolute -top-2 -right-2 animate-spin" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Rotate Your Device
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            For the best tank combat experience, please rotate your device to landscape mode.
          </p>
          
          {/* Benefits */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-sky-400 font-bold mb-3">Landscape Mode Benefits:</h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>• Better visibility of incoming obstacles</li>
              <li>• Improved touch controls and responsiveness</li>
              <li>• Enhanced gameplay experience</li>
            </ul>
          </div>
          
          {/* Visual guide */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-12 border-2 border-gray-500 rounded-sm mb-1"></div>
              <span className="text-xs text-gray-400">Portrait</span>
            </div>
            <div className="text-sky-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-8 border-2 border-sky-400 rounded-sm mb-1"></div>
              <span className="text-xs text-sky-400">Landscape</span>
            </div>
          </div>
          
          {/* Exit option */}
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300"
          >
            Exit Game
          </button>
        </div>
      </div>
    );
  }

  // Speed selector screen
  if (showSpeedSelector) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-sky-500 rounded-2xl p-8 max-w-md mx-4">
          <h2 className="text-3xl font-orbitron font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Select Initial Speed
            </span>
          </h2>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Speed:</span>
              <span className="text-sky-400 font-bold text-xl">{initialSpeed.toFixed(1)}x</span>
            </div>
            
            <input
              type="range"
              min="3.0"
              max="6.0"
              step="0.1"
              value={initialSpeed}
              onChange={(e) => setInitialSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>3.0x (Slow)</span>
              <span>6.0x (Fast)</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
            >
              Start Game
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative">
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-sky-400 rounded-lg game-canvas"
        />
        
        {/* Game UI Overlay */}
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

        {/* Fire Button for Mobile */}
        {isMobile && gameState.current.missilesReady && (
          <button
            onClick={fireMissile}
            className="absolute bottom-4 right-4 bg-red-500/80 backdrop-blur-sm text-white p-4 rounded-full hover:bg-red-500 transition-colors text-lg font-bold"
          >
            🚀 FIRE
          </button>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-white font-rajdhani">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm space-y-1">
              <div><span className="text-sky-400">SPACE</span> - Jump</div>
              <div><span className="text-sky-400">F</span> - Fire Missile</div>
              <div><span className="text-sky-400">P</span> - Pause</div>
              {!gameState.current.missilesReady && (
                <div><span className="text-red-400">Missiles unlock at 100 points</span></div>
              )}
            </div>
          </div>
        </div>

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
                  onClick={() => setShowSpeedSelector(true)}
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
        {isPaused && !gameOver && (
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