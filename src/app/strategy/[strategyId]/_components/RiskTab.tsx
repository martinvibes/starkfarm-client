import {
  Badge,
  Box,
  Flex,
  ListItem,
  OrderedList,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { StrategyInfo } from '@/store/strategies.atoms';
import { getRiskColor, getRiskExplaination } from '@strkfarm/sdk';
import { useMemo } from 'react';

interface RiskTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function RiskTab(props: RiskTabProps) {
  const { strategy, isMobile } = props;

  const getRiskString = (riskValue: number): string => {
    if (riskValue === 0) {
      return 'No risk';
    } else if (riskValue <= 1) {
      return 'Very Low';
    } else if (riskValue <= 2) {
      return 'Low';
    } else if (riskValue < 3) {
      return 'Medium';
    }
    return 'High';
  };

  const risks = useMemo(() => {
    const _risks = strategy.metadata.risk.riskFactor.map((risk) => ({
      type: risk.type.toLowerCase(),
      value: risk.value,
      color: getRiskColor(risk),
      toolTip: getRiskExplaination(risk.type),
    }));
    const noRisks = strategy.metadata.risk.notARisks.map((risk) => ({
      type: risk.toLowerCase(),
      value: 0,
      color: 'text_secondary',
      toolTip: `${getRiskExplaination(risk)}`,
    }));
    return [..._risks, ...noRisks];
  }, [strategy.metadata.risk.riskFactor, strategy.metadata.risk.notARisks]);

  return (
    <Flex padding={'16px 16px'} gap={'24px'} direction={'column'}>
      {risks.length > 0 && (
        <Box>
          <Text color={'text_primary'} mb={'10px'}>
            Risk Assessment
          </Text>
          <Flex wrap={'wrap'} gap={2}>
            {risks.map((risk, index) => (
              <Tooltip label={risk.toolTip} key={index}>
                <Badge
                  padding={'8px 16px'}
                  borderRadius={'2xl'}
                  bg={'mycard_light_2x'}
                  color={risk.color}
                  textTransform={'capitalize'}
                >
                  {risk.type}: {getRiskString(risk.value)}
                </Badge>
              </Tooltip>
            ))}
          </Flex>
        </Box>
      )}
      <Box>
        <Text color={'text_primary'} mb={'10px'}>
          Risk details
        </Text>
        <Flex
          width={'100%'}
          maxWidth={'500px'}
          flexDirection={'column'}
          gap={'16px'}
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
            marginLeft={0}
            flexDirection={'column'}
            gap={'16px'}
          >
            {strategy.risks.map((r, index) => (
              <ListItem
                color="text_secondary"
                bg={{ base: 'mycard_light', md: 'mycard' }}
                key={r}
                width={'fit-content'}
                fontSize={'14px'}
                fontWeight={'500'}
                alignItems={'justify'}
                padding={'10px'}
                borderRadius={'8px'}
                data-number={index + 1}
              >
                {r}
                {index === 0 && (
                  <Badge
                    padding={'4px 8px'}
                    borderRadius={'4px'}
                    bg={
                      strategy.riskFactor <= 1
                        ? 'light_green_2'
                        : strategy.riskFactor < 3
                          ? 'yellow_2'
                          : 'red_2'
                    }
                    color={'black'}
                    fontSize={'10px'}
                    fontWeight={'500'}
                    textTransform={'none'}
                    marginLeft={'10px'}
                  >
                    {getRiskString(strategy.riskFactor)}
                    {' risk'}
                  </Badge>
                )}
              </ListItem>
            ))}
          </OrderedList>
        </Flex>
      </Box>
    </Flex>
  );
}
