
import type { FC } from 'react';

export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: SubscriptionTier;
  joinDate: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: FC<{ className?: string }>;
  systemInstruction: string;
  placeholder: string;
  type: 'text' | 'image' | 'audio' | 'video';
  category: 'Writing' | 'Visual' | 'Audio' | 'Productivity' | 'Dev' | 'Reasoning' | 'Business';
  coverGradient: string;
  backgroundImage?: string;
  model?: string;
  thinkingBudget?: number;
  requiresPro?: boolean; // New: Restrict access
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  requiresPro?: boolean;
  outputType: 'text' | 'image' | 'video' | 'audio' | 'mindmap';
  persona?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  videoUrl?: string;
  poster?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  author: string;
  coverGradient: string;
  modules: Module[];
  requiresPro?: boolean;
}
