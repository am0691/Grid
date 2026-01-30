/**
 * Create Soul Use Case
 */

import type { ISoulRepository, IProgressRepository } from '../../ports/repositories';
import type { Soul, CreateSoulDto, AreaProgress } from '../../../domain/entities';
import type { TrainingType } from '../../../domain/value-objects';
import { AreaService } from '../../../domain/services';
import { getMaxWeeks } from '../../../domain/value-objects';

export class CreateSoulUseCase {
  private readonly soulRepository: ISoulRepository;
  private readonly progressRepository: IProgressRepository;

  constructor(
    soulRepository: ISoulRepository,
    progressRepository: IProgressRepository
  ) {
    this.soulRepository = soulRepository;
    this.progressRepository = progressRepository;
  }

  async execute(dto: CreateSoulDto): Promise<Soul> {
    // 영혼 생성
    const soul = await this.soulRepository.create(dto);

    // 초기 진도 생성
    const initialProgress = this.createInitialProgress(soul.trainingType);

    for (const areaProgress of initialProgress) {
      for (const item of areaProgress.items) {
        await this.progressRepository.update({
          soulId: soul.id,
          areaId: areaProgress.areaId,
          week: item.week,
          status: item.status
        });
      }
    }

    return soul;
  }

  private createInitialProgress(trainingType: TrainingType): AreaProgress[] {
    const areaIds = AreaService.getAreaIds(trainingType);
    const maxWeek = getMaxWeeks(trainingType);

    return areaIds.map(areaId => ({
      areaId,
      currentWeek: 1,
      items: Array.from({ length: maxWeek }, (_, i) => ({
        week: i + 1,
        status: i === 0 ? 'current' : 'future'
      }))
    }));
  }
}
