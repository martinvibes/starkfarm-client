import { Box, Center, Spinner, Flex, Text, Image } from '@chakra-ui/react';
import { STRKFarmStrategyAPIResult } from '@/store/strkfarm.atoms';
import FlowChart from './FlowChart';
import depositAction from '@/assets/depositAction.svg';
import withdrawAction from '@/assets/withdrawAction.svg';
import loopAction from '@/assets/loopAction.svg';

interface DetailsTabProps {
  strategy: STRKFarmStrategyAPIResult;
  isMobile?: boolean;
}

export function DetailsTab(props: DetailsTabProps) {
  const { strategy, isMobile } = props;

  return (
    <Flex flexDirection={'column'} padding={'24px 16px'} gap={'24px'}>
      <Flex width={'100%'}>
        {strategy.actions.length > 0 && (
          <Flex
            flexDirection={'column'}
            width={'623px'}
            gap={'16px'}
            padding={'0 16px'}
          >
            <>
              <Text fontSize={'24px'} fontWeight={'600'} color={'white'}>
                Steps performed by the strategy
              </Text>
              {strategy.actions.map((action, index) => (
                <Box
                  className="text-cell"
                  display={{ base: 'block', md: 'flex' }}
                  key={index}
                  width={'100%'}
                  bg="mycard"
                  fontSize={'14px'}
                  borderRadius={'8px'}
                  padding={'10px'}
                >
                  {action.name.toLowerCase().includes('stake') ||
                  action.name.toLowerCase().includes('supply') ? (
                    <Image src={depositAction.src} />
                  ) : action.name.toLowerCase().includes('borrow') ? (
                    <Image src={withdrawAction.src} />
                  ) : (
                    <Image src={loopAction.src} />
                  )}
                  <Text padding={'5px 10px'} color={'border_light'}>
                    {action.name}
                  </Text>
                </Box>
              ))}
              {strategy.actions.length == 0 && (
                <Center width={'100%'} padding={'10px'}>
                  <Spinner size={'xs'} color="white" />
                </Center>
              )}
            </>
          </Flex>
        )}

        <FlowChart strategyId={strategy.id} />
      </Flex>
    </Flex>
  );
}
