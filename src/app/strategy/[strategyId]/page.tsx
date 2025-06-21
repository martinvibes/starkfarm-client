import { Container } from '@chakra-ui/react';

import { getStrategies } from '@/store/strategies.atoms';
import Strategy from './_components/Strategy';

export type StrategyParams = {
  params: { strategyId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: StrategyParams) {
  const strategies = getStrategies();
  const strategy = strategies.find((s) => s.id === params?.strategyId);
  if (strategy) {
    return {
      title: `${strategy.name} | Troves`,
      description: strategy.description,
    };
  }

  return {
    title: 'Yield Strategy | Troves',
    description:
      "Troves's yield strategies are designed to maximize your yield farming returns. Stake your assets in our strategies to earn passive income while we take care of the rest.",
  };
}

export default function StrategyPage({ params }: StrategyParams) {
  return (
    <Container width={'100%'} margin={'0 auto'} padding={0}>
      <Strategy params={params} />
    </Container>
  );
}
