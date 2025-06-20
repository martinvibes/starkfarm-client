'use client';

import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Container,
  Flex,
  Image,
  HStack,
  Link,
  Spinner,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import mixpanel from 'mixpanel-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import shield from '@/assets/shield.svg';

import { DUMMY_BAL_ATOM, returnEmptyBal } from '@/store/balance.atoms';
import { addressAtom } from '@/store/claims.atoms';
import { strategiesAtom, StrategyInfo } from '@/store/strategies.atoms';
import { TxHistoryAtom } from '@/store/transactions.atom';
import { getTokenInfoFromAddr } from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { StrategyParams } from '../page';
import {
  STRKFarmBaseAPYsAtom,
  STRKFarmStrategyAPIResult,
} from '@/store/strkfarm.atoms';
import { ManageTab } from './ManageTab';
import { RiskTab } from './RiskTab';
import { DetailsTab } from './DetailsTab';
import { FAQTab } from './FAQTab';
import { TransactionsTab } from './TransactionsTab';

function HoldingsText({
  strategy,
  address,
  balData,
}: {
  strategy: StrategyInfo<any>;
  address: string | undefined;
  balData: any;
}) {
  if (strategy.settings.isInMaintenance)
    return <span style={{ color: 'orange' }}>Maintenance Mode</span>;
  if (!address) return 'Connect wallet';
  if (balData.isLoading || !balData.data?.tokenInfo) {
    return (
      <>
        <Spinner size="sm" marginTop={'5px'} />
      </>
    );
  }
  if (balData.isError) {
    console.error('Balance data error:', balData.error);
    return 'Error';
  }
  const value = Number(
    balData.data.amount.toEtherToFixedDecimals(
      balData.data.tokenInfo?.displayDecimals || 2,
    ),
  );
  if (value === 0 || strategy?.isRetired()) return '-';
  return `${balData.data.amount.toEtherToFixedDecimals(
    balData.data.tokenInfo?.displayDecimals || 2,
  )} ${balData.data.tokenInfo?.name}`;
}

function NetEarningsText({
  strategy,
  address,
  profit,
  balData,
}: {
  strategy: StrategyInfo<any>;
  address: string | undefined;
  profit: number;
  balData: any;
}) {
  if (
    !address ||
    profit === 0 ||
    strategy?.isRetired() ||
    strategy.settings.isInMaintenance
  )
    return '-';
  return `${profit?.toFixed(
    balData.data.tokenInfo?.displayDecimals || 2,
  )} ${balData.data.tokenInfo?.name}`;
}

function HoldingsAndEarnings({
  strategy,
  address,
  balData,
  profit,
}: {
  strategy: StrategyInfo<any>;
  address: string | undefined;
  balData: any;
  profit: number;
}) {
  return (
    <Flex width={'100%'} justifyContent={'space-between'}>
      <Box>
        <Text>
          <b>Your Holdings </b>
        </Text>
        <Text color="cyan">
          <HoldingsText
            strategy={strategy}
            address={address}
            balData={balData}
          />
        </Text>
      </Box>
      {!strategy.settings.isTransactionHistDisabled && (
        <Tooltip label={!strategy?.isRetired() && 'Life time earnings'}>
          <Box>
            <Text textAlign={'right'} fontWeight={'none'}>
              <b>Net earnings</b>
            </Text>
            <Text textAlign={'right'} color={profit >= 0 ? 'cyan' : 'red'}>
              <NetEarningsText
                strategy={strategy}
                address={address}
                profit={profit}
                balData={balData}
              />
            </Text>
          </Box>
        </Tooltip>
      )}
    </Flex>
  );
}

const Strategy = ({ params }: StrategyParams) => {
  const address = useAtomValue(addressAtom);
  const strategies = useAtomValue(strategiesAtom);
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
  }, [params.strategyId, strategies.map((id) => id).toString()]);

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

  const balData = useAtomValue(strategy?.balanceSummaryAtom || DUMMY_BAL_ATOM);
  const individualBalances = useAtomValue(
    strategy?.balancesAtom || atom([returnEmptyBal()]),
  );
  console.log('balData', balData);

  const txHistoryAtom = useMemo(
    () => TxHistoryAtom(strategyAddress, address!),
    [address, strategyAddress],
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
  }, [JSON.stringify(txHistoryResult.data)]);

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

  const strategiesInfo = useAtomValue(STRKFarmBaseAPYsAtom);
  const strategyCached = useMemo(() => {
    if (!strategiesInfo || !strategiesInfo.data) return null;
    const strategiesList: STRKFarmStrategyAPIResult[] =
      strategiesInfo.data.strategies;
    return strategiesList.find((s: any) => s.id === params.strategyId);
  }, [strategiesInfo, params.strategyId]);

  if (!isMounted) return null;

  function getUniqueById(items: { id: string; logo: string }[]) {
    const uniqueItems = new Map<string, { id: string; logo: string }>();
    items.forEach((item) => {
      if (!uniqueItems.has(item.id)) {
        uniqueItems.set(item.id, item);
      }
    });
    return Array.from(uniqueItems.values());
  }
  return (
    <Container
      display={'flex'}
      justifyContent={'center'}
      width={'100%'}
      margin={'0 auto'}
      padding={0}
    >
      <Flex
        width={'100%'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Flex bg={'bg_2'} width={'100%'} justifyContent={'center'}>
          <Flex
            width={'100%'}
            maxWidth={'1152px'}
            flexDirection={'column'}
            height={'484px'}
            paddingTop={'64px'}
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
                    <AvatarGroup size={'md'} spacing={'-20px'} mr={'5px'}>
                      {strategy &&
                        strategy.metadata.depositTokens.length > 0 &&
                        strategy.metadata.depositTokens.map((token: any) => {
                          return (
                            <Avatar
                              key={token.address}
                              marginRight={'5px'}
                              src={token.logo}
                              width={'64px'}
                              height={'64px'}
                            />
                          );
                        })}
                      {strategy &&
                        strategy.metadata.depositTokens.length == 0 && (
                          <Avatar
                            marginRight={'5px'}
                            src={strategy?.holdingTokens[0].logo}
                            width={'64px'}
                            height={'64px'}
                          />
                        )}
                    </AvatarGroup>
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
                    <Wrap as="div">
                      {getUniqueById(
                        strategy.actions.map((p) => ({
                          id: p.pool.protocol.name,
                          logo: p.pool.protocol.logo,
                        })),
                      ).map((p) => (
                        <WrapItem as="div" marginRight={'10px'} key={p.id}>
                          <Center as="div">
                            <Avatar
                              size="2xs"
                              bg={'black'}
                              src={p.logo}
                              marginRight={'2px'}
                            />
                            <Text marginTop={'2px'}>{p.id}</Text>
                          </Center>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Flex>
                </Flex>
                <Box
                  padding={'10px'}
                  borderRadius={'10px'}
                  bg={'bg'}
                  marginTop={'20px'}
                >
                  <HoldingsAndEarnings
                    strategy={strategy}
                    address={address}
                    balData={balData}
                    profit={profit}
                  />

                  {individualBalances.length > 1 &&
                    balData.data?.amount.compare('0', 'gt') && (
                      <Tooltip label="Detailed info of your individual token holdings in the strategy. This can vary with time depending on market conditions. The above value is the holdings in aggregated as a single token.">
                        <HStack
                          className="flex"
                          gap={2}
                          fontSize={'12px'}
                          color="light_grey"
                          marginTop={'5px'}
                          borderTop={'1px solid var(--chakra-colors-highlight)'}
                          paddingTop={'5px'}
                        >
                          <p>Detailed Split:</p>
                          {individualBalances.map((bx, index) => {
                            return (
                              <Text key={index}>
                                {bx?.amount.toEtherToFixedDecimals(
                                  bx.tokenInfo?.displayDecimals || 2,
                                )}{' '}
                                {bx?.tokenInfo?.name}
                              </Text>
                            );
                          })}
                        </HStack>
                      </Tooltip>
                    )}

                  {address &&
                    balData.data &&
                    strategy.id == 'xstrk_sensei' &&
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
                        marginTop={'10px'}
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
                </Box>
                {strategy?.isRetired() && (
                  <Alert
                    fontSize={'14px'}
                    color={'light_grey'}
                    borderRadius={'10px'}
                    bg="color2_50p"
                    paddingY={'10px'}
                    px={'14px'}
                    mt={'5'}
                  >
                    <AlertIcon />

                    <Text>
                      This strategy is retired due to zkLend exploit. You can
                      recover your partial funds from{' '}
                      <Link href="/recovery" color={'white'}>
                        here.
                      </Link>
                    </Text>
                  </Alert>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex width={'100%'} maxWidth={'1152px'}>
          <Tabs
            position="relative"
            variant="unstyled"
            width={'100%'}
            index={tabIndex}
            onChange={handleTabsChange}
          >
            <TabPanels>
              <TabPanel width={'100%'} padding={0}>
                {strategy && <ManageTab strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategy && <RiskTab strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategyCached && <DetailsTab strategy={strategyCached} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategy && <FAQTab strategy={strategy} />}
              </TabPanel>

              <TabPanel width={'100%'} padding={0}>
                {strategy && (
                  <TransactionsTab strategy={strategy} txHistory={txHistory} />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Strategy;
