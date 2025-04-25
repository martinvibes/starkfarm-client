import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Spinner,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { StrategyInfo } from '@/store/strategies.atoms';
import { HarvestTimeAtom } from '@/store/harvest.atom';
import { useAtomValue } from 'jotai';
import { formatTimediff, getDisplayCurrencyAmount } from '@/utils';
import { isMobile } from 'react-device-detect';
import STRKFarmAtoms, {
  STRKFarmStrategyAPIResult,
} from '@/store/strkfarm.atoms';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface HarvestTimeProps {
  strategy: StrategyInfo<any>;
  balData: any;
}

const HarvestTime: React.FC<HarvestTimeProps> = ({ strategy, balData }) => {
  const { address } = useAccount();
  const holdingToken: any = strategy.holdingTokens[0];
  const contractAddress = holdingToken.address || holdingToken.token || '';

  const harvestTimeAtom = useMemo(
    () => HarvestTimeAtom(contractAddress),
    [address],
  );

  const harvestTime = useAtomValue(harvestTimeAtom);

  const data = harvestTime.data?.findManyHarvests[0];

  const lastHarvest = useMemo(() => {
    if (!data || !data.timestamp) return null;
    return new Date(Number(data.timestamp) * 1000);
  }, [data?.timestamp]);

  const harvestTimestamp = useMemo(() => {
    const DAYMS = 86400 * 1000;
    // Base date is last harvest time + 2 days or now (for no harvest strats)
    const baseDate = lastHarvest
      ? new Date(lastHarvest.getTime() + 2 * DAYMS)
      : new Date();

    // With base date, get next sunday 12am UTC
    // set date to coming sunday in UTC
    const nextHarvest = baseDate;
    nextHarvest.setUTCDate(
      nextHarvest.getUTCDate() + (7 - nextHarvest.getUTCDay()),
    );
    nextHarvest.setUTCHours(0);
    nextHarvest.setUTCMinutes(0);
    nextHarvest.setUTCSeconds(0);

    // if nextHarvest is within 24hrs of last harvest,
    // increase it by 7 days
    // This is needed as harvest can happen anytime near deadline
    if (
      lastHarvest &&
      nextHarvest.getTime() - lastHarvest.getTime() < 86400 * 1000
    ) {
      nextHarvest.setUTCDate(nextHarvest.getUTCDate() + 7);
    }

    return formatTimediff(nextHarvest);
  }, [data?.timestamp, lastHarvest]);

  const strategiesInfo = useAtomValue(STRKFarmAtoms.baseAPRs!);

  const strategyInfo = useMemo(() => {
    if (!strategiesInfo || !strategiesInfo.data) return null;

    const strategiesList: STRKFarmStrategyAPIResult[] =
      strategiesInfo.data.strategies;
    const strategyInfo = strategiesList.find(
      (strat) => strat.id == strategy.id,
    );
    return strategyInfo ? strategyInfo : null;
  }, [strategiesInfo]);

  const leverage = useMemo(() => {
    if (!strategyInfo) return 0;
    return strategyInfo.leverage || 0;
  }, [strategyInfo]);

  const defaultAPYTooltip =
    'Current APY including any fees. Net returns subject to change based on market conditions.';
  return (
    <Flex width={'100%'} flexDirection={'column'}>
      <Flex width={'100%'} justifyContent="space-between">
        <Flex gap={'8px'}>
          <Tooltip
            label={
              <Box fontSize={'13px'}>
                <Text>
                  {strategy.metadata.apyMethodology || defaultAPYTooltip}
                </Text>
                {strategyInfo && (
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
                      {(strategyInfo.apySplit.baseApy * 100).toFixed(2)}%
                    </Text>
                  </Box>
                )}
                {strategyInfo && strategyInfo.apySplit.rewardsApy > 0 && (
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
                      {(strategyInfo.apySplit.rewardsApy * 100).toFixed(2)}%
                    </Text>
                  </Box>
                )}
              </Box>
            }
          >
            <Stat
              display={'flex'}
              flexDirection={'column'}
              bg={'dark_navy'}
              height={'73px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
              borderRadius={'8px'}
              padding={'8px'}
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
                color="light_green"
                lineHeight="100%"
                fontSize={'32px'}
                fontWeight={'700'}
              >
                {((strategyInfo?.apy || 0) * 100).toFixed(2)}%
              </StatNumber>
            </Stat>
          </Tooltip>

          <Tooltip label="Boosted rewards from STRKFarm">
            <Tag
              alignSelf={'flex-end'}
              bg="bg_3"
              color={'white'}
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

        {!isMobile && !strategy.settings.hideHarvestInfo && (
          <Tooltip
            label={`This is when your investment increases as STRK rewards are automatically claimed and reinvested into the strategy's tokens.`}
          >
            <Flex
              alignItems={'center'}
              gap={'32px'}
              borderRadius={'8px'}
              bg={'black_3p'}
              padding={'8px 16px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
            >
              <Text
                color="border_light"
                fontSize="14px"
                fontWeight="500"
                display={'flex'}
              >
                Next Harvest in:{' '}
                {harvestTimestamp.isZero && (
                  <Text color={'cyan'} fontWeight={'bold'} marginLeft={'5px'}>
                    Anytime now
                  </Text>
                )}
              </Text>

              <Box
                display="flex"
                alignItems="center"
                gap="10px"
                justifyContent="space-between"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bg="bg"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                >
                  <Text color="silver_gray" fontSize="12px" fontWeight="300">
                    Days
                  </Text>
                  <Text
                    color="border_light"
                    fontSize={'16px'}
                    fontWeight={'600'}
                  >
                    {harvestTimestamp.days ?? 0}
                  </Text>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bg="bg"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                >
                  <Text color="silver_gray" fontSize="12px" fontWeight="300">
                    Hour
                  </Text>
                  <Text
                    color="border_light"
                    fontSize={'16px'}
                    fontWeight={'600'}
                  >
                    {harvestTimestamp.hours ?? 0}
                  </Text>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bg="bg"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                >
                  <Text color="silver_gray" fontSize="12px" fontWeight="300">
                    Mins
                  </Text>
                  <Text
                    color="border_light"
                    fontSize={'16px'}
                    fontWeight={'600'}
                  >
                    {harvestTimestamp.minutes ?? 0}
                  </Text>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bg="bg"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                >
                  <Text color="silver_gray" fontSize="12px" fontWeight="300">
                    Secs
                  </Text>
                  <Text
                    color="border_light"
                    fontSize={'16px'}
                    fontWeight={'600'}
                  >
                    {harvestTimestamp.seconds ?? 0}
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Tooltip>
        )}
      </Flex>

      <Flex justifyContent={'space-between'}>
        <Flex alignItems={'center'} height={'40px'}>
          <Link
            color={'silver_gray'}
            fontSize={'14px'}
            fontWeight={'500'}
            lineHeight={'100%'}
            textDecoration={'none'}
          >
            Contract details <ExternalLinkIcon />
          </Link>
        </Flex>

        {!strategy.settings.hideHarvestInfo && (
          <Flex
            alignItems={'center'}
            height={'40px'}
            bg={'bg'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderRadius={'8px'}
            padding={'8px'}
            marginTop={'10px'}
            gap={'2px'}
          >
            <Text
              color={'silver_gray'}
              fontSize={'12px'}
              fontWeight={'400'}
              lineHeight={'100%'}
            >
              Total rewards harvested:
            </Text>

            <Text
              color={'white'}
              fontSize={'12px'}
              fontWeight={'400'}
              lineHeight={'100%'}
            >
              {getDisplayCurrencyAmount(
                harvestTime?.data?.totalStrkHarvestedByContract.STRKAmount || 0,
                2,
              )}{' '}
              STRK
            </Text>

            <Text color={'silver_gray'}> | </Text>

            <Text
              color={'silver_gray'}
              fontSize={'12px'}
              fontWeight={'400'}
              lineHeight={'100%'}
            >
              Total number of times harvested:
            </Text>

            <Text
              color={'white'}
              fontSize={'12px'}
              fontWeight={'400'}
              lineHeight={'100%'}
            >
              -
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default HarvestTime;
