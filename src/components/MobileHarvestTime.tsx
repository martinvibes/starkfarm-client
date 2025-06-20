import React, { useMemo } from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { StrategyInfo } from '@/store/strategies.atoms';
import { HarvestTimeAtom } from '@/store/harvest.atom';
import { useAtomValue } from 'jotai';
import { formatTimediff, getDisplayCurrencyAmount } from '@/utils';
import STRKFarmAtoms, {
  STRKFarmStrategyAPIResult,
} from '@/store/strkfarm.atoms';

interface MobileHarvestTimeProps {
  strategy: StrategyInfo<any>;
}

const MobileHarvestTime: React.FC<MobileHarvestTimeProps> = ({ strategy }) => {
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

  return (
    <Flex width={'100%'} flexDirection={'column'} gap={'10px'}>
      <Flex width={'100%'} justifyContent="space-between">
        {!strategy.settings.hideHarvestInfo && (
          <Tooltip
            label={`This is when your investment increases as STRK rewards are automatically claimed and reinvested into the strategy's tokens.`}
          >
            <Flex
              width={'100%'}
              flexDirection="column"
              alignItems={'center'}
              gap={'10px'}
              borderRadius={'8px'}
              bg={'#00000008'}
              padding={'8px 16px'}
              borderWidth={'1px'}
              borderColor={'#2D2D3D'}
            >
              <Text
                color="#CFCFEA"
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
                  bg="#181824"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'#2D2D3D'}
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
                  bg="#181824"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'#2D2D3D'}
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
                  bg="#181824"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'#2D2D3D'}
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
                  bg="#181824"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                  borderWidth={'1px'}
                  borderColor={'#2D2D3D'}
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
        {!strategy.settings.hideHarvestInfo && (
          <Flex
            width={'100%'}
            flexDirection={'column'}
            alignItems={'center'}
            bg={'bg'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderRadius={'8px'}
            padding={'8px'}
            gap={'10px'}
          >
            <Flex gap={'2px'}>
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
                  harvestTime?.data?.totalStrkHarvestedByContract.STRKAmount ||
                    0,
                  2,
                )}{' '}
                STRK
              </Text>
            </Flex>

            <Flex gap={'2px'}>
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
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default MobileHarvestTime;
