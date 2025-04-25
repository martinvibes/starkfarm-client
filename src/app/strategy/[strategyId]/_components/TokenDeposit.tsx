import Deposit from '@/components/Deposit';
import { StrategyInfo } from '@/store/strategies.atoms';
import {
  Alert,
  AlertIcon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

interface TokenDepositProps {
  strategy: StrategyInfo<any>;
  isDualToken?: boolean;
}

export function TokenDeposit(props: TokenDepositProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const { strategy } = props;
  return (
    <Tabs
      position="relative"
      variant="unstyled"
      width={'100%'}
      onChange={(index) => {
        setTabIndex(index);
      }}
    >
      <TabList borderRadius={'8px'}>
        <Tab
          width={'100%'}
          bg="purple_60p"
          color="color_5"
          fontSize={'14px'}
          fontWeight={'700'}
          borderTopLeftRadius={'8px'}
          _selected={{ bg: 'bright_purple', color: 'black' }}
          onClick={() => {
            // mixpanel.track('All pools clicked')
          }}
        >
          Deposit
        </Tab>
        <Tab
          width={'100%'}
          bg="purple_60p"
          color="color_5"
          fontSize={'14px'}
          fontWeight={'700'}
          borderTopRightRadius={'8px'}
          _selected={{ bg: 'bright_purple', color: 'black' }}
          onClick={() => {
            // mixpanel.track('Strategies opened')
          }}
        >
          Withdraw
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          width={'100%'}
          padding={'20px 16px'}
          borderBottomLeftRadius={'8px'}
        >
          {tabIndex == 0 && (
            <>
              <Deposit
                strategy={strategy}
                buttonText="Deposit"
                callsInfo={strategy.depositMethods}
                isDualToken={props.isDualToken || false}
              />
              {strategy.settings.alerts != undefined && (
                <VStack mt={'20px'}>
                  {strategy.settings.alerts
                    .filter((a) => a.tab == 'deposit' || a.tab == 'all')
                    .map((alert, index) => (
                      <Alert
                        status={alert.type}
                        fontSize={'12px'}
                        color={'light_grey'}
                        borderRadius={'10px'}
                        bg="color2_50p"
                        padding={'10px'}
                        key={index}
                      >
                        <AlertIcon />
                        {alert.text}
                      </Alert>
                    ))}
                </VStack>
              )}
            </>
          )}
        </TabPanel>
        <TabPanel
          width={'100%'}
          padding={'20px 16px'}
          borderBottomRightRadius={'8px'}
        >
          {tabIndex == 1 && (
            <>
              <Deposit
                strategy={strategy}
                buttonText="Redeem"
                callsInfo={strategy.withdrawMethods}
                isDualToken={props.isDualToken || false}
              />
              {strategy.settings.alerts != undefined && (
                <VStack mt={'20px'}>
                  {strategy.settings.alerts
                    .filter((a) => a.tab == 'withdraw' || a.tab == 'all')
                    .map((alert, index) => (
                      <Alert
                        status={alert.type}
                        fontSize={'12px'}
                        color={'light_grey'}
                        borderRadius={'10px'}
                        bg="color2_50p"
                        padding={'10px'}
                        key={index}
                      >
                        <AlertIcon />
                        {alert.text}
                      </Alert>
                    ))}
                </VStack>
              )}
            </>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
