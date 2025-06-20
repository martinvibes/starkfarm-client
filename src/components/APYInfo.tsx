import { StrategyInfo } from '@/store/strategies.atoms';
import { STRKFarmStrategyAPIResult } from '@/store/strkfarm.atoms';
import {
  Flex,
  Tooltip,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Spinner,
} from '@chakra-ui/react';
import { useMemo } from 'react';

export function APYInfo(props: {
  strategy: StrategyInfo<any>;
  strategyAPIResult: STRKFarmStrategyAPIResult;
}) {
  const { strategy, strategyAPIResult } = props;

  const defaultAPYTooltip =
    'Current APY including any fees. Net returns subject to change based on market conditions.';

  const leverage = useMemo(() => {
    if (!strategyAPIResult) return 0;
    return strategyAPIResult.leverage || 0;
  }, [strategyAPIResult]);

  return (
    <Flex gap={'8px'}>
      <Tooltip
        label={
          <Box fontSize={'13px'}>
            <Text>{strategy.metadata.apyMethodology || defaultAPYTooltip}</Text>
            {strategyAPIResult && (
              <Box
                marginTop={'10px'}
                justifyContent={'space-between'}
                display={'flex'}
              >
                <Box>
                  <Text>Strategy APY:</Text>
                  <Text fontSize={'12px'} opacity={0.7}>
                    Including fees and Defi spring rewards
                  </Text>
                </Box>
                <Text fontWeight={'bold'}>
                  {(strategyAPIResult.apySplit.baseApy * 100).toFixed(2)}%
                </Text>
              </Box>
            )}
            {strategyAPIResult && strategyAPIResult.apySplit.rewardsApy > 0 && (
              <Box
                marginTop={'10px'}
                justifyContent={'space-between'}
                display={'flex'}
              >
                <Box>
                  <Text>Rewards APY:</Text>
                  <Text fontSize={'12px'} opacity={0.7}>
                    Incentives by STRKFarm
                  </Text>
                </Box>
                <Text fontWeight={'bold'}>
                  {(strategyAPIResult.apySplit.rewardsApy * 100).toFixed(2)}%
                </Text>
              </Box>
            )}
          </Box>
        }
      >
        <Stat
          display={'flex'}
          flexDirection={'column'}
          bg={'mycard'}
          borderRadius={'md'}
          padding={'16px'}
          gap={'10px'}
        >
          <StatLabel
            color={'border_light'}
            fontSize={'14px'}
            fontWeight={'500'}
          >
            APY
          </StatLabel>
          <StatNumber
            color="purple"
            lineHeight="100%"
            fontSize={'32px'}
            fontWeight={'700'}
          >
            {((strategyAPIResult?.apy || 0) * 100).toFixed(2)}%
          </StatNumber>
        </Stat>
      </Tooltip>

      <Tooltip label="Boosted rewards from STRKFarm">
        <Tag
          alignSelf={'flex-end'}
          bg="mycard_dark"
          color={'text_secondary'}
          fontSize={'14px'}
          fontWeight={'500'}
          padding={'4px 8px'}
          width={'fit-content'}
          height={'29px'}
          borderRadius={'20px'}
        >
          🔥{leverage.toFixed(2)}x boosted
          {leverage === 0 && <Spinner size="xs" color="white" ml={'5px'} />}
        </Tag>
      </Tooltip>
    </Flex>
  );
}
