import {
  Badge,
  Flex,
  ListItem,
  OrderedList,
  Box,
  Text,
} from '@chakra-ui/react';
import { StrategyInfo } from '@/store/strategies.atoms';

interface RiskTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function RiskTab(props: RiskTabProps) {
  const { strategy, isMobile } = props;

  if (isMobile) {
    return (
      <Flex direction="column" gap="16px" width="100%">
        <Box
          width="100%"
          borderRadius="8px"
          borderWidth="1px"
          borderColor="slate_blue"
          bg="bg_2"
          p={4}
        >
          <Text fontSize="18px" fontWeight="600" color="white" mb={2}>
            Risk
          </Text>
          <Flex direction="column" gap={3}>
            {strategy.risks.map((r, index) => (
              <Box
                key={index}
                borderRadius="8px"
                borderWidth="1px"
                borderColor="slate_blue"
                bg="bg"
                p={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Text color="border_light" fontSize="14px" fontWeight="500">
                  {r}
                </Text>
                {index === 0 && (
                  <Badge
                    padding={'4px 8px'}
                    borderRadius={'4px'}
                    bg={
                      strategy.riskFactor <= 2
                        ? 'light_green_2'
                        : strategy.riskFactor < 4
                          ? 'yellow_2'
                          : 'red_2'
                    }
                    color={'color_6'}
                    fontSize={'10px'}
                    fontWeight={'500'}
                    textTransform={'none'}
                    marginLeft={'10px'}
                  >
                    {strategy.riskFactor <= 2
                      ? 'Low'
                      : strategy.riskFactor < 4
                        ? 'Medium'
                        : 'High'}{' '}
                    risk
                  </Badge>
                )}
              </Box>
            ))}
          </Flex>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex padding={'24px 0px'} gap={'24px'}>
      <Flex
        width={'623px'}
        flexDirection={'column'}
        gap={'16px'}
        padding={'16px 0px'}
      >
        <OrderedList
          fontSize={'14px'}
          fontWeight={'400'}
          color={'border_light'}
          listStyleType="none"
          css={{
            '& li': {
              position: 'relative',
              paddingLeft: '2.5em',

              '&::before': {
                content: 'attr(data-number)',
                position: 'absolute',
                left: '10px',
                top: '12px',
                padding: '4px 8px',
                color: 'black',
                fontSize: '10px',
                borderRadius: '50%',
                backgroundColor: 'white',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          }}
          display={'flex'}
          flexDirection={'column'}
          gap={'32px'}
        >
          {strategy.risks.map((r, index) => (
            <ListItem
              color="border_light"
              key={r}
              width={'fit-content'}
              fontSize={'14px'}
              fontWeight={'500'}
              alignItems={'justify'}
              padding={'10px'}
              borderRadius={'8px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
              data-number={index + 1}
            >
              {r}
              {index === 0 && (
                <Badge
                  padding={'4px 8px'}
                  borderRadius={'4px'}
                  bg={
                    strategy.riskFactor === 0
                      ? 'light_green_2'
                      : strategy.riskFactor < 2.5
                        ? 'yellow_2'
                        : 'red_2'
                  }
                  color={'color_6'}
                  fontSize={'10px'}
                  fontWeight={'500'}
                  textTransform={'none'}
                  marginLeft={'10px'}
                >
                  {strategy.riskFactor <= 2
                    ? 'Low'
                    : strategy.riskFactor < 4
                      ? 'Medium'
                      : 'High'}
                  risk
                </Badge>
              )}
            </ListItem>
          ))}
        </OrderedList>
      </Flex>
    </Flex>
  );
}
