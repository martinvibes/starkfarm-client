import { StrategyLiveStatus } from '@/strategies/IStrategy';

export function getLiveStatusNumber(status: StrategyLiveStatus) {
  if (status == StrategyLiveStatus.HOT) {
    return 1;
  }
  if (status == StrategyLiveStatus.NEW) {
    return 2;
  } else if (status == StrategyLiveStatus.ACTIVE) {
    return 3;
  } else if (status == StrategyLiveStatus.COMING_SOON) {
    return 4;
  }
  return 5;
}

export function getLiveStatusEnum(status: number) {
  if (status == 1) {
    return StrategyLiveStatus.HOT;
  }
  if (status == 2) {
    return StrategyLiveStatus.NEW;
  } else if (status == 3) {
    return StrategyLiveStatus.ACTIVE;
  } else if (status == 4) {
    return StrategyLiveStatus.COMING_SOON;
  }
  return StrategyLiveStatus.RETIRED;
}
