/**
 * Supabase Soul Repository Implementation
 * Supabase 테이블과 연동하는 Soul CRUD 구현체
 * Demo Mode에서는 localStorage 사용
 */

import { supabase } from '../../services/supabase/client';
import type { Soul, SoulProfile, CreateSoulDto, UpdateSoulDto } from '../../../domain/entities';
import type { Soul as DbSoul, SoulInsert, SoulUpdate } from '../../database/schema';

// Demo Mode 체크
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_STORAGE_KEY = 'grid_demo_souls';

// Demo Mode용 localStorage 헬퍼
const getDemoSouls = (): Soul[] => {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDemoSouls = (souls: Soul[]): void => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(souls));
};

/**
 * DB Soul을 Domain Soul로 변환
 */
const mapDbToDomain = (dbSoul: DbSoul): Soul => ({
  id: dbSoul.id,
  name: dbSoul.name,
  trainingType: dbSoul.training_type,
  startDate: dbSoul.start_date,
  createdAt: dbSoul.created_at,
  updatedAt: dbSoul.updated_at,
  trainerId: dbSoul.user_id,
  isActive: dbSoul.is_active ?? true,
  phoneNumber: dbSoul.phone_number ?? undefined,
  email: dbSoul.email ?? undefined,
  address: dbSoul.address ?? undefined,
  birthDate: dbSoul.birth_date ?? undefined,
  notes: dbSoul.notes ?? undefined,
  profile: dbSoul.profile ? dbSoul.profile as SoulProfile : undefined,
});

/**
 * 현재 사용자의 모든 Souls 조회
 */
export const getSouls = async (): Promise<Soul[]> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    return getDemoSouls();
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('souls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch souls: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};

/**
 * ID로 Soul 조회
 */
export const getSoulById = async (id: string): Promise<Soul | null> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const souls = getDemoSouls();
    return souls.find(s => s.id === id) || null;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('souls')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch soul: ${error.message}`);
  }

  return data ? mapDbToDomain(data) : null;
};

/**
 * Soul 생성
 */
export const createSoul = async (dto: CreateSoulDto): Promise<Soul> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const souls = getDemoSouls();
    const newSoul: Soul = {
      id: `demo-${Date.now()}`,
      name: dto.name,
      trainingType: dto.trainingType,
      startDate: dto.startDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trainerId: 'demo-user-001',
      isActive: true,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      notes: dto.notes,
      profile: dto.profile,
    };
    souls.unshift(newSoul);
    saveDemoSouls(souls);
    return newSoul;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const insertData: SoulInsert = {
    user_id: user.id,
    name: dto.name,
    training_type: dto.trainingType,
    start_date: dto.startDate,
    phone_number: dto.phoneNumber ?? null,
    email: dto.email ?? null,
    address: null,
    birth_date: null,
    is_active: true,
    notes: dto.notes ?? null,
    profile: dto.profile ? (dto.profile as unknown as Record<string, unknown>) : null,
  };

  const { data, error } = await supabase
    .from('souls')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create soul: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * Soul 업데이트
 */
export const updateSoul = async (id: string, dto: UpdateSoulDto): Promise<Soul> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const souls = getDemoSouls();
    const index = souls.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Soul not found');
    souls[index] = { ...souls[index], ...dto, updatedAt: new Date().toISOString() };
    saveDemoSouls(souls);
    return souls[index];
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: SoulUpdate = {};
  if (dto.name !== undefined) updateData.name = dto.name;
  if (dto.phoneNumber !== undefined) updateData.phone_number = dto.phoneNumber;
  if (dto.email !== undefined) updateData.email = dto.email;
  if (dto.address !== undefined) updateData.address = dto.address;
  if (dto.birthDate !== undefined) updateData.birth_date = dto.birthDate;
  if (dto.notes !== undefined) updateData.notes = dto.notes;
  if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
  if (dto.profile !== undefined) updateData.profile = dto.profile as unknown as Record<string, unknown>;

  const { data, error } = await supabase
    .from('souls')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update soul: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * Soul 삭제
 */
export const deleteSoul = async (id: string): Promise<void> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const souls = getDemoSouls();
    saveDemoSouls(souls.filter(s => s.id !== id));
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('souls')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete soul: ${error.message}`);
  }
};
