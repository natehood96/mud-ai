// Shared types between client and server

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Character {
  id: number;
  userId: number;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  location: string;
  createdAt: Date;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  exits: string[];
  createdAt: Date;
}

export interface GameStatus {
  status: 'online' | 'offline' | 'maintenance';
  players: number;
  uptime: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

