/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterId = 'salman' | 'srk';

export interface Character {
  id: CharacterId;
  name: string;
  fullName: string;
  tagline: string;
  color: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isAttacking: boolean;
  attackTimeout: number | null;
  direction: 'left' | 'right';
  specialCharge: number;
  isSpecialActive: boolean;
  specialTimeout: number | null;
  score: number;
}

export type GameState = 'lobby' | 'playing' | 'gameOver';

export interface GameSettings {
  maxHealth: number;
  gravity: number;
  jumpForce: number;
  speed: number;
  attackRange: number;
  damage: number;
  specialDamage: number;
}
