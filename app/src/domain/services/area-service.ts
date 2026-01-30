/**
 * Area Service Domain Service
 * 영역 관련 비즈니스 로직
 */

import type { Area, AreaMeta } from '../value-objects/area';
import type { TrainingType } from '../value-objects/training-type';
import { CONVERT_AREAS, DISCIPLE_AREAS } from '../value-objects/area';

export class AreaService {
  /**
   * 영역 메타데이터 가져오기
   */
  static getAreaMeta(areaId: Area, trainingType: TrainingType): AreaMeta {
    const areas = trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
    const meta = areas.find(a => a.id === areaId);

    if (!meta) {
      throw new Error(`Area not found: ${areaId}`);
    }

    return meta;
  }

  /**
   * 모든 영역 ID 가져오기
   */
  static getAreaIds(trainingType: TrainingType): Area[] {
    return trainingType === 'convert'
      ? CONVERT_AREAS.map(a => a.id)
      : DISCIPLE_AREAS.map(a => a.id);
  }

  /**
   * 모든 영역 메타데이터 가져오기
   */
  static getAllAreas(trainingType: TrainingType): AreaMeta[] {
    return trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  }

  /**
   * 영역 검증
   */
  static isValidArea(areaId: string, trainingType: TrainingType): boolean {
    const areas = trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
    return areas.some(a => a.id === areaId);
  }
}
