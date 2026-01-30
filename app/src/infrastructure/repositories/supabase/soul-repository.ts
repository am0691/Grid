/**
 * Supabase Soul Repository Implementation
 * Supabase 테이블과 연동하는 Soul CRUD 구현체
 */

import { supabase } from '../../services/supabase/client';
import type { Soul, CreateSoulDto, UpdateSoulDto } from '../../../domain/entities';
import type { Soul as DbSoul, SoulInsert, SoulUpdate } from '../../database/schema';

/**
 * Domain Soul을 DB Soul로 변환
 * (현재 사용되지 않지만 향후 확장 가능)
 */
// @ts-expect-error - 향후 사용을 위해 보존
const _mapDomainToDb = (soul: Partial<Soul>): Partial<DbSoul> => {
  return {
    name: soul.name,
    training_type: soul.trainingType,
    start_date: soul.startDate,
    user_id: soul.trainerId,
  };
};

/**
 * DB Soul을 Domain Soul로 변환
 */
const mapDbToDomain = (dbSoul: DbSoul): Soul => {
  return {
    id: dbSoul.id,
    name: dbSoul.name,
    trainingType: dbSoul.training_type,
    startDate: dbSoul.start_date,
    createdAt: dbSoul.created_at,
    updatedAt: dbSoul.updated_at,
    trainerId: dbSoul.user_id,
    isActive: true, // DB에는 isActive 필드가 없지만 기본값 제공
  };
};

/**
 * 현재 사용자의 모든 Souls 조회
 */
export const getSouls = async (): Promise<Soul[]> => {
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const insertData: SoulInsert = {
    user_id: user.id,
    name: dto.name,
    training_type: dto.trainingType,
    start_date: dto.startDate,
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: SoulUpdate = {
    name: dto.name,
  };

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
