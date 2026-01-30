/**
 * Repository Ports (Interfaces)
 * Application Layer에서 정의하는 인터페이스
 */

import type {
  Soul,
  CreateSoulDto,
  UpdateSoulDto,
  SoulProgress,
  UpdateProgressDto,
  MemoHistoryItem,
  ActivityPlan,
  CreateActivityPlanDto,
  UpdateActivityPlanDto,
  ActivityPlanFilter,
  User,
  UserProfile
} from '../../domain/entities';

/**
 * Soul Repository Interface
 */
export interface ISoulRepository {
  findById(id: string): Promise<Soul | null>;
  findByTrainerId(trainerId: string): Promise<Soul[]>;
  findAll(): Promise<Soul[]>;
  create(dto: CreateSoulDto): Promise<Soul>;
  update(id: string, dto: UpdateSoulDto): Promise<Soul>;
  delete(id: string): Promise<void>;
  findWithProgress(id: string): Promise<SoulProgress | null>;
}

/**
 * Progress Repository Interface
 */
export interface IProgressRepository {
  findBySoulId(soulId: string): Promise<SoulProgress | null>;
  update(dto: UpdateProgressDto): Promise<void>;
  findMemoHistory(soulId: string): Promise<MemoHistoryItem[]>;
  saveMemo(item: Omit<MemoHistoryItem, 'id' | 'createdAt'>): Promise<MemoHistoryItem>;
}

/**
 * Activity Plan Repository Interface
 */
export interface IActivityPlanRepository {
  findById(id: string): Promise<ActivityPlan | null>;
  findBySoulId(soulId: string): Promise<ActivityPlan[]>;
  findByFilter(filter: ActivityPlanFilter): Promise<ActivityPlan[]>;
  create(dto: CreateActivityPlanDto): Promise<ActivityPlan>;
  update(id: string, dto: UpdateActivityPlanDto): Promise<ActivityPlan>;
  delete(id: string): Promise<void>;
}

/**
 * User Repository Interface
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findProfile(id: string): Promise<UserProfile | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<UserProfile>): Promise<User>;
}
