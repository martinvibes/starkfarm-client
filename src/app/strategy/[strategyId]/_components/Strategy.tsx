'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Image,
  Link,
  ListItem,
  OrderedList,
  Spinner,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import mixpanel from 'mixpanel-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import shield from '@/assets/shield.svg';

import Deposit from '@/components/Deposit';
import HarvestTime from '@/components/HarvestTime';
import { DUMMY_BAL_ATOM } from '@/store/balance.atoms';
import { addressAtom } from '@/store/claims.atoms';
import { strategiesAtom, StrategyInfo } from '@/store/strategies.atoms';
import { transactionsAtom, TxHistoryAtom } from '@/store/transactions.atom';
import { getTokenInfoFromAddr } from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { StrategyParams } from '../page';
import { getRiskExplaination } from '@strkfarm/sdk';

function Manage({ strategy }: { strategy: StrategyInfo<any> }) {
  return (
    <Flex padding={'24px 0px'} gap={'24px'}>
      <Flex
        width={'50%'}
        height={'280px'}
        flexDirection={'column'}
        gap={'16px'}
        padding={'32px 16px'}
        borderRadius={'8px'}
        borderWidth={'1px'}
        borderColor={'slate_blue'}
      >
        <Text fontSize={'24px'} fontWeight={'600'} color={'white'}>
          How does it work?
        </Text>
        <UnorderedList
          fontSize={'14px'}
          fontWeight={'400'}
          color={'border_light'}
        >
          <ListItem>
            Deposit USDC to automatically loop funds between zkLend and Nostra.
          </ListItem>
          <ListItem>
            Creates a delta-neutral position to maximize USDC yield.
          </ListItem>
          <ListItem>
            Position is periodically adjusted to maintain a healthy health
            factor
          </ListItem>
          <ListItem>
            Receive an NFT as representation for your stake on STRKFarm.
          </ListItem>
          <ListItem>Withdraw anytime by redeeming your NFT for USDC.</ListItem>
        </UnorderedList>

        <Flex alignItems={'center'} gap={'8px'}>
          <Text fontSize={'24px'} fontWeight={'600'} color={'white'}>
            Risk
          </Text>
          {strategy.metadata.risk.riskFactor.map((r: any, i: number) => (
            <Tooltip label={getRiskExplaination(r.type)} key={i}>
              <Badge padding={'5px 10px'} borderRadius={'10px'} opacity={0.8}>
                {r.type.valueOf()}
              </Badge>
            </Tooltip>
          ))}
        </Flex>
      </Flex>

      <Flex
        width={'50%'}
        borderRadius={'8px'}
        borderWidth={'1px'}
        borderColor={'slate_blue'}
      >
        <Tabs position="relative" variant="unstyled" width={'100%'}>
          <TabList borderRadius={'8px'}>
            <Tab
              width={'100%'}
              bg="purple_60p"
              color="color_5"
              fontSize={'14px'}
              fontWeight={'700'}
              borderTopLeftRadius={'8px'}
              _selected={{ bg: 'bright_purple', color: 'black' }}
              onClick={() => {}}
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
              onClick={() => {}}
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
              <Deposit
                strategy={strategy}
                buttonText="Deposit"
                callsInfo={strategy.depositMethods}
              />
              {strategy.settings.alerts !== undefined && (
                <VStack mt={'20px'}>
                  {strategy.settings.alerts
                    .filter((a) => a.tab === 'deposit' || a.tab === 'all')
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
            </TabPanel>
            <TabPanel
              width={'100%'}
              padding={'20px 16px'}
              borderBottomRightRadius={'8px'}
            >
              <Deposit
                strategy={strategy}
                buttonText="Redeem"
                callsInfo={strategy.withdrawMethods}
              />
              {strategy.settings.alerts !== undefined && (
                <VStack mt={'20px'}>
                  {strategy.settings.alerts
                    .filter((a) => a.tab === 'withdraw' || a.tab === 'all')
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Flex>
  );
}

function Risk({ strategy }: { strategy: StrategyInfo<any> }) {
  return (
    <Flex padding={'24px 0px'} gap={'24px'}>
      <Flex
        width={'623px'}
        flexDirection={'column'}
        gap={'16px'}
        padding={'32px 16px'}
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
            </ListItem>
          ))}
        </OrderedList>
      </Flex>
    </Flex>
  );
}

function Details({ strategy }: { strategy: StrategyInfo<any> }) {
  return (
    <Flex flexDirection={'column'} padding={'24px 0px'} gap={'24px'}>
      <Flex flexDirection={'column'} gap={'8px'}>
        <Text fontSize={'24px'} color={'white'} fontWeight={'600'}>
          Behind the scenes
        </Text>
        <Text fontSize={'14px'} color={'border_light'}>
          Actions done automatically by the strategy (smart-contract) with an
          investment of $1000
        </Text>
      </Flex>

      <Flex width={'623px'} gap={'16px'} padding={'32px 16px'}>
        {strategy.actions.map((action, index) => (
          <Box
            className="text-cell"
            display={{ base: 'block', md: 'flex' }}
            key={index}
            width={'100%'}
            color="light_grey"
            fontSize={'14px'}
          >
            <Text width={{ base: '100%', md: '50%' }} padding={'5px 10px'}>
              {action.name}
            </Text>
            <Text width={{ base: '100%', md: '30%' }} padding={'5px 10px'}>
              <Avatar
                size="2xs"
                bg={'black'}
                src={action.pool.pool.logos[0]}
                marginRight={'2px'}
              />{' '}
              {action.pool.pool.name} on
              <Avatar
                size="2xs"
                bg={'black'}
                src={action.pool.protocol.logo}
                marginRight={'2px'}
                marginLeft={'5px'}
              />{' '}
              {action.pool.protocol.name}
            </Text>
          </Box>
        ))}
        {strategy.actions.length == 0 && (
          <Center width={'100%'} padding={'10px'}>
            <Spinner size={'xs'} color="white" />
          </Center>
        )}
      </Flex>
    </Flex>
  );
}

function FAQ() {
  return (
    <Flex flexDirection={'column'} padding={'24px 0px'} gap={'24px'}>
      <Text fontSize={'24px'} color={'white'} fontWeight={'600'}>
        Get to know about all your doubts
      </Text>

      <Flex>
        <Flex flexDirection={'column'} width={'696px'} gap={'16px'}>
          <Accordion
            width={'100%'}
            display={'flex'}
            flexDirection={'column'}
            gap={'16px'}
          >
            <AccordionItem
              borderRadius={'8px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
            >
              <Text fontSize={'14px'} fontWeight={'500'} color={'border_light'}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Question asked basis zkLend
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel
                pb={4}
                fontSize={'14px'}
                fontWeight={'400'}
                lineHeight={'20px'}
                color={'silver_gray'}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem
              borderRadius={'8px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
            >
              <Text fontSize={'14px'} fontWeight={'500'} color={'border_light'}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Question asked basis zkLend
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel
                pb={4}
                fontSize={'14px'}
                fontWeight={'400'}
                lineHeight={'20px'}
                color={'silver_gray'}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem
              borderRadius={'8px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
            >
              <Text fontSize={'14px'} fontWeight={'500'} color={'border_light'}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Question asked basis zkLend
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel
                pb={4}
                fontSize={'14px'}
                fontWeight={'400'}
                lineHeight={'20px'}
                color={'silver_gray'}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem
              borderRadius={'8px'}
              borderWidth={'1px'}
              borderColor={'slate_blue'}
            >
              <Text fontSize={'14px'} fontWeight={'500'} color={'border_light'}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Question asked basis zkLend
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel
                pb={4}
                fontSize={'14px'}
                fontWeight={'400'}
                lineHeight={'20px'}
                color={'silver_gray'}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>

        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          alignSelf={'center'}
          gap={'16px'}
          marginLeft={'auto'}
          marginRight={'auto'}
        >
          <Flex
            flexDirection={'column'}
            width={'415px'}
            gap={'8px'}
            padding={'10px'}
            borderWidth={'1px'}
            borderRadius={'8px'}
            borderColor={'slate_blue'}
          >
            <Text
              fontSize={'14px'}
              fontWeight={'500'}
              color={'border_light'}
              textAlign={'center'}
            >
              For more queries reach out to us on Telegram
            </Text>
            <Text
              fontSize={'14px'}
              fontWeight={'400'}
              color={'silver_gray'}
              textAlign={'center'}
            >
              Our team will respond to you soon!
            </Text>
          </Flex>

          <Link href="https://t.me/+HQ_eHaXmF-1lZDc1">
            <Button
              bg={'transparent'}
              padding={'12px 20px'}
              borderRadius={'100px'}
              borderWidth={'1px'}
              borderColor={'color_7'}
              color={'color_7'}
              fontSize={'14px'}
              fontWeight={'700'}
              _hover={{
                bg: 'transparent',
                color: 'color_7',
              }}
            >
              Connect on Telegram
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}

const Strategy = ({ params }: StrategyParams) => {
  const address = useAtomValue(addressAtom);
  const strategies = useAtomValue(strategiesAtom);
  const transactions = useAtomValue(transactionsAtom);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

  function setRoute(value: string) {
    router.push(`?tab=${value}`);
  }

  function handleTabsChange(index: number) {
    switch (index) {
      case 0:
        setRoute('manage');
        break;
      case 1:
        setRoute('risk');
        break;
      case 2:
        setRoute('details');
        break;
      case 3:
        setRoute('faq');
        break;
      case 4:
        setRoute('transactions');
        break;
      default:
        setRoute('manage');
        break;
    }
  }

  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  useEffect(() => {
    (async () => {
      const tab = searchParams.get('tab');

      switch (tab) {
        case 'manage':
          setTabIndex(0);
          break;
        case 'risk':
          setTabIndex(1);
          break;
        case 'details':
          setTabIndex(2);
          break;
        case 'faq':
          setTabIndex(3);
          break;
        case 'transactions':
          setTabIndex(4);
          break;
        default:
          setTabIndex(0);
          break;
      }
    })();
  }, [searchParams]);

  const strategy: StrategyInfo<any> | undefined = useMemo(() => {
    const id = params.strategyId;

    return strategies.find((s) => s.id === id);
  }, [params.strategyId, strategies]);

  const strategyAddress = useMemo(() => {
    const holdingTokens = strategy?.holdingTokens;
    if (holdingTokens && holdingTokens.length) {
      const holdingTokenInfo: any = holdingTokens[0];
      return (holdingTokenInfo.address || holdingTokenInfo.token) as string;
    }
    return '';
  }, [strategy]);

  const setBalQueryEnable = useSetAtom(strategy?.balEnabled || atom(false));

  useEffect(() => {
    setBalQueryEnable(true);
  }, []);

  const balData = useAtomValue(strategy?.balanceAtom || DUMMY_BAL_ATOM);

  // fetch tx history
  const txHistoryAtom = useMemo(
    () =>
      TxHistoryAtom(
        strategyAddress,
        address!,
        strategy?.balanceAtom || DUMMY_BAL_ATOM,
      ),
    [address, strategyAddress, balData],
  );
  const txHistoryResult = useAtomValue(txHistoryAtom);
  const txHistory = useMemo(() => {
    if (txHistoryResult.data) {
      return {
        findManyInvestment_flows: [
          ...txHistoryResult.data.findManyInvestment_flows,
        ].sort((a, b) => {
          return b.timestamp - a.timestamp;
        }),
      };
    }
    console.log(
      'TxHistoryAtom',
      txHistoryResult.error,
      txHistoryResult.isError,
      txHistoryResult.isLoading,
    );
    return txHistoryResult.data || { findManyInvestment_flows: [] };
  }, [txHistoryResult.data]);

  // compute profit
  // profit doesnt change quickly in real time, but total deposit amount can change
  // and it can impact the profit calc as txHistory may not be updated at the same time as balData
  // So, we compute profit once only
  const [profit, setProfit] = useState(0);
  const computeProfit = useCallback(() => {
    if (!txHistory.findManyInvestment_flows.length) return 0;
    const tokenInfo = getTokenInfoFromAddr(
      txHistory.findManyInvestment_flows[0].asset,
    );
    if (!tokenInfo) return 0;
    const netDeposits = txHistory.findManyInvestment_flows.reduce((acc, tx) => {
      const sign = tx.type === 'deposit' ? 1 : -1;
      return (
        acc +
        sign *
          Number(
            new MyNumber(tx.amount, tokenInfo.decimals).toEtherToFixedDecimals(
              4,
            ),
          )
      );
    }, 0);
    const currentValue = Number(
      balData.data?.amount.toEtherToFixedDecimals(4) || '0',
    );
    if (currentValue === 0) return 0;

    if (netDeposits === 0) return 0;
    setProfit(currentValue - netDeposits);
  }, [txHistory, balData]);

  useEffect(() => {
    if (profit == 0) {
      computeProfit();
    }
  }, [txHistory, balData]);

  useEffect(() => {
    mixpanel.track('Strategy page open', { name: params.strategyId });
  }, [params.strategyId]);

  const colSpan1: any = { base: '5', md: '3' };
  const colSpan2: any = { base: '5', md: '2' };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Container width={'100%'} margin={'0 auto'} padding={0}>
      <Flex width={'100%'} flexDirection={'column'}>
        <Flex
          flexDirection={'column'}
          bg={'bg_2'}
          width={'100%'}
          height={'484px'}
          padding={'64px'}
          gap={'64px'}
        >
          <Box>
            <Link href="/?tab=strategies">
              <Button
                bg={'transparent'}
                color={'white'}
                borderWidth={'1px'}
                borderColor={'border_light'}
                leftIcon={<ArrowBackIcon />}
                _hover={{
                  bg: 'transparent',
                  color: 'white',
                }}
              >
                Back
              </Button>
            </Link>
          </Box>

          {strategy && (
            <Flex flexDirection={'column'} gap={'16px'}>
              <Flex justifyContent={'space-between'}>
                <Flex gap={'16px'} alignItems={'center'}>
                  <Avatar
                    src={strategy?.holdingTokens[0].logo}
                    width={'64px'}
                    height={'64px'}
                  />
                  <Text fontSize={'32px'} fontWeight={'600'} color="white">
                    {strategy ? strategy.name : 'Strategy Not found'}
                  </Text>
                  <Box
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    bg={'light_green'}
                    width={'24px'}
                    height={'24px'}
                    padding={'3px 5px'}
                    borderRadius={'20px'}
                  >
                    <Image src={shield.src} alt="badge" />
                  </Box>
                </Flex>

                <Flex gap={'16px'}>
                  <Flex
                    flexDirection={'column'}
                    alignItems={'flex-end'}
                    gap={'8px'}
                    bg={'highlight'}
                    borderWidth={'1px'}
                    borderColor={'border_light_30p'}
                    borderRadius={'6px'}
                    width={'199px'}
                    height={'76px'}
                    padding={'16px'}
                  >
                    <Text
                      color={'border_light'}
                      fontSize={'14px'}
                      fontWeight={'500'}
                    >
                      Your Holdings:
                    </Text>

                    {!balData.isLoading &&
                      !balData.isError &&
                      !balData.isPending &&
                      balData.data &&
                      balData.data.tokenInfo && (
                        <Text color="text" fontSize={'18px'} fontWeight={'700'}>
                          {address
                            ? Number(
                                balData.data.amount.toEtherToFixedDecimals(
                                  balData.data.tokenInfo?.displayDecimals || 2,
                                ),
                              ) === 0 || strategy?.isRetired()
                              ? '-'
                              : `${balData.data.amount.toEtherToFixedDecimals(balData.data.tokenInfo?.displayDecimals || 2)} ${balData.data.tokenInfo?.name}`
                            : 'Connect wallet'}
                        </Text>
                      )}

                    {(balData.isLoading ||
                      balData.isPending ||
                      !balData.data?.tokenInfo) && (
                      <Text color="text" fontSize={'18px'} fontWeight={'700'}>
                        {address ? <Spinner size="sm" /> : 'Connect wallet'}
                      </Text>
                    )}

                    {balData.isError && (
                      <Text color="text" fontSize={'18px'} fontWeight={'700'}>
                        Your Holdings: Error
                      </Text>
                    )}

                    {address &&
                      balData.data &&
                      strategy.id === 'xstrk_sensei' &&
                      profit < 0 &&
                      profit /
                        Number(balData.data.amount.toEtherToFixedDecimals(6)) <
                        -0.01 && (
                        <Alert
                          status={'info'}
                          fontSize={'12px'}
                          color={'light_grey'}
                          borderRadius={'10px'}
                          bg="color2_50p"
                          padding={'10px'}
                        >
                          <AlertIcon />
                          Why did my holdings drop?{' '}
                          <a
                            href="https://docs.strkfarm.com/p/faq#q.-why-did-my-holdings-decrease-in-the-xstrk-sensei-strategy"
                            style={{
                              marginLeft: '5px',
                              textDecoration: 'underline',
                            }}
                            target="_blank"
                          >
                            Learn more
                          </a>
                        </Alert>
                      )}
                  </Flex>

                  <Flex
                    flexDirection={'column'}
                    alignItems={'flex-end'}
                    gap={'8px'}
                    bg={'highlight'}
                    borderWidth={'1px'}
                    borderColor={'border_light_30p'}
                    borderRadius={'6px'}
                    width={'199px'}
                    height={'76px'}
                    padding={'16px'}
                  >
                    <Text
                      color={'border_light'}
                      fontSize={'14px'}
                      fontWeight={'500'}
                    >
                      Net earnings
                    </Text>

                    {!balData.isLoading &&
                      !balData.isError &&
                      !balData.isPending &&
                      balData.data &&
                      balData.data.tokenInfo && (
                        <Tooltip
                          label={!strategy?.isRetired() && 'Life time earnings'}
                        >
                          <Text
                            color={
                              profit > 0 ? 'cyan' : profit < 0 ? 'red' : 'text'
                            }
                            fontSize={'18px'}
                            fontWeight={'700'}
                          >
                            {address && profit !== 0 && !strategy?.isRetired()
                              ? `${profit?.toFixed(balData.data.tokenInfo?.displayDecimals || 2)} ${balData.data.tokenInfo?.name}`
                              : '-'}
                          </Text>
                        </Tooltip>
                      )}
                  </Flex>
                </Flex>
              </Flex>

              <Flex>
                <Flex width={'100%'}>
                  {!strategy?.isRetired() && (
                    <HarvestTime strategy={strategy} balData={balData} />
                  )}
                </Flex>
              </Flex>
            </Flex>
          )}

          <Tabs
            position="relative"
            variant="unstyled"
            width={'100%'}
            index={tabIndex}
            onChange={handleTabsChange}
          >
            <TabList>
              <Tab
                color={'silver_gray'}
                _selected={{ color: 'light_green', fontWeight: 'bold' }}
                onClick={() => {
                  mixpanel.track('Manage clicked');
                }}
              >
                Manage
              </Tab>
              <Tab
                color={'silver_gray'}
                _selected={{ color: 'light_green', fontWeight: 'bold' }}
                onClick={() => {
                  mixpanel.track('Risk clicked');
                }}
              >
                Risk
              </Tab>
              <Tab
                color={'silver_gray'}
                _selected={{ color: 'light_green', fontWeight: 'bold' }}
                onClick={() => {
                  mixpanel.track('Details clicked');
                }}
              >
                Details
              </Tab>
              <Tab
                color={'silver_gray'}
                _selected={{ color: 'light_green', fontWeight: 'bold' }}
                onClick={() => {
                  mixpanel.track('FAQs clicked');
                }}
              >
                FAQs
              </Tab>
              <Tab
                color={'silver_gray'}
                _selected={{ color: 'light_green', fontWeight: 'bold' }}
                onClick={() => {
                  mixpanel.track('Transactions clicked');
                }}
              >
                Transactions
              </Tab>
            </TabList>
            <TabIndicator
              mt="-1.5px"
              height="3px"
              bg="light_green"
              color="color1"
              borderRadius="1px"
            />
          </Tabs>
        </Flex>

        <Flex paddingLeft={'64px'} paddingRight={'64px'}>
          <Tabs
            position="relative"
            variant="unstyled"
            width={'100%'}
            index={tabIndex}
            onChange={handleTabsChange}
          >
            <TabPanels>
              <TabPanel width={'100%'} padding={0}>
                {strategy && <Manage strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategy && <Risk strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategy && <Details strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                <FAQ />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Strategy;
