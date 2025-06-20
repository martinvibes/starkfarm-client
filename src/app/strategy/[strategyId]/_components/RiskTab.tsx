import { Badge, Flex, ListItem, OrderedList } from '@chakra-ui/react';
import { StrategyInfo } from '@/store/strategies.atoms';

interface RiskTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function RiskTab(props: RiskTabProps) {
  const { strategy, isMobile } = props;

  return (
    <Flex padding={'16px 0px'} gap={'24px'}>
      <Flex width={'623px'} flexDirection={'column'} gap={'16px'}>
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
