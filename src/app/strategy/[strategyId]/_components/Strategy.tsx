'use client';

import {
  Avatar,
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
  Tab,
  Text,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  TabList,
  TabIndicator,
  VStack,
} from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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
import MobileHarvestTime from '@/components/MobileHarvestTime';
import HarvestTime from '@/components/HarvestTime';
import { StrategyInfoComponent } from './StrategyInfo';
import { APYInfo } from '@/components/APYInfo';

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
    <Flex width={'100%'} justifyContent={'space-between'} gap={2}>
      <Box padding={'16px'} bg="mycard" width={'100%'} borderRadius={'lg'}>
        <Text color={'text_secondary'}>
          <b>Your Holdings </b>
        </Text>
        <Text color="purple">
          <HoldingsText
            strategy={strategy}
            address={address}
            balData={balData}
          />
        </Text>
      </Box>
      {!strategy.settings.isTransactionHistDisabled && (
        <Tooltip label={!strategy?.isRetired() && 'Life time earnings'}>
          <Box padding={'16px'} bg="mycard" width={'100%'} borderRadius={'lg'}>
            <Text
              textAlign={'right'}
              fontWeight={'none'}
              color={'text_secondary'}
            >
              <b>Net earnings</b>
            </Text>
            <Text
              textAlign={'right'}
              color={profit >= 0 ? 'light_green_2' : 'red'}
            >
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
  const [accordionIndex, setAccordionIndex] = useState(0);

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
      display={{ base: 'none', md: 'flex' }}
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
        <Flex bg={'mybg'} width={'100%'} justifyContent={'center'}>
          <Flex
            width={'100%'}
            maxWidth={'1152px'}
            flexDirection={'column'}
            paddingTop={'32px'}
            gap={'48px'}
          >
            <Box>
              <Link href="/?tab=strategies">
                <Button
                  bg={'mycard_light'}
                  color={'text_primary'}
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
            <HStack justifyContent={'space-between'} width={'100%'}>
              {strategy && (
                <VStack gap={6}>
                  <StrategyInfoComponent strategy={strategy} />
                  {!strategy?.isRetired() && strategyCached && (
                    <Box
                      alignItems={'flex-start'}
                      justifyItems={'flex-start'}
                      width={'100%'}
                    >
                      <APYInfo
                        strategy={strategy}
                        strategyAPIResult={strategyCached}
                      />
                    </Box>
                  )}
                </VStack>
              )}

              {strategy && (
                <VStack gap={6}>
                  <HoldingsAndEarnings
                    strategy={strategy}
                    address={address}
                    balData={balData}
                    profit={profit}
                  />
                  <HarvestTime strategy={strategy} balData={balData} />
                </VStack>
              )}
            </HStack>

            <Tabs
              position="relative"
              variant="unstyled"
              width={'100%'}
              index={tabIndex}
              onChange={handleTabsChange}
            >
              <TabList borderBottom={'2px solid var(--chakra-colors-mycard)'}>
                <Tab
                  color={'text_secondary'}
                  _selected={{ color: 'purple', fontWeight: 'bold' }}
                  onClick={() => {
                    mixpanel.track('Manage clicked');
                  }}
                >
                  Manage
                </Tab>
                <Tab
                  color={'text_secondary'}
                  _selected={{ color: 'purple', fontWeight: 'bold' }}
                  onClick={() => {
                    mixpanel.track('Risk clicked');
                  }}
                >
                  Risks
                </Tab>
                <Tab
                  color={'text_secondary'}
                  _selected={{ color: 'purple', fontWeight: 'bold' }}
                  onClick={() => {
                    mixpanel.track('Details clicked');
                  }}
                >
                  Details
                </Tab>
                <Tab
                  color={'text_secondary'}
                  _selected={{ color: 'purple', fontWeight: 'bold' }}
                  onClick={() => {
                    mixpanel.track('FAQs clicked');
                  }}
                >
                  FAQs
                </Tab>
                <Tab
                  color={'text_secondary'}
                  _selected={{ color: 'purple', fontWeight: 'bold' }}
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
                bg="purple"
                color="color1"
                borderRadius="1px"
              />
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
                    <TransactionsTab
                      strategy={strategy}
                      txHistory={txHistory}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Flex>
      </Flex>

      {/* MOBILE VIEW */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        flexDirection="column"
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          bg="#1B1724"
          paddingTop="24px"
          paddingLeft="8px"
          paddingRight="8px"
          paddingBottom="16px"
        >
          <Flex width="100%" justifyContent="center">
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              color="white"
              fontWeight="bold"
              fontSize="18px"
              padding="12px 16px"
              borderWidth="1px"
              borderColor="#CFCFEA"
              borderRadius="12px"
              _hover={{ bg: 'transparent', color: 'white' }}
              onClick={() => router.push('/?tab=strategies')}
              height="auto"
            >
              Back
            </Button>
          </Flex>

          <Box
            borderRadius="12px"
            display="flex"
            gap="16px"
            alignItems="center"
            justifyContent="center"
          >
            <Avatar src={strategy?.holdingTokens[0]?.logo || ''} size="lg" />
            <Text fontWeight="600" fontSize="32px" color="white">
              {strategy?.name}
            </Text>
            {strategy?.settings.isAudited && (
              <Box
                width="24px"
                height="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                backgroundColor="#1AFCA0"
                borderRadius="full"
              >
                <Image src={shield.src} alt="badge" />
              </Box>
            )}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
            alignItems="center"
          >
            <Flex align="center" gap="4px">
              <Box
                bg="#181824"
                display="flex"
                alignItems="center"
                padding="8px"
                borderRadius="md"
              >
                <Text
                  color="border_light"
                  fontWeight="bold"
                  fontSize="16px"
                  mr={1}
                >
                  APY
                </Text>
                <Text color="light_green" fontWeight="bold" fontSize="22px">
                  {strategyCached?.apySplit?.baseApy
                    ? `${(strategyCached.apySplit.baseApy * 100).toFixed(2)}%`
                    : '23.94%'}
                </Text>
              </Box>
              <Box
                bg="black"
                color="white"
                display="flex"
                alignItems="center"
                fontSize="14px"
                fontWeight="500"
                padding="4px 8px"
                borderRadius="20px"
              >
                <span role="img" aria-label="fire">
                  🔥
                </span>
                {`${strategyCached?.leverage?.toFixed(2)}x boosted`}
              </Box>
            </Flex>
            <Link
              href={strategy?.metadata.auditUrl || '#'}
              color="#8E8E8E"
              fontSize="14px"
              display="flex"
              alignItems="center"
              gap="4px"
              isExternal
              fontWeight="600"
              justifyContent="center"
            >
              Contract details <ExternalLinkIcon />
            </Link>
          </Box>

          <Flex width="100%" gap={3} mb={3}>
            <Box
              flex="1"
              bg="mycard"
              padding="16px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              gap="4px"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
            >
              <Text color="#CFCFEA" fontSize="14px">
                Your holdings:
              </Text>
              <Text color="white" fontWeight="extrabold" fontSize="22px">
                {address && balData && balData.data && balData.data.tokenInfo
                  ? `${balData.data.amount.toEtherToFixedDecimals(balData.data.tokenInfo?.displayDecimals || 2)} ${balData.data.tokenInfo?.name}`
                  : '-'}
              </Text>
            </Box>
            <Box
              flex="1"
              bg="#1A1A27"
              padding="16px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              gap="4px"
              alignItems="center"
              justifyContent="center"
              borderWidth="1px"
              borderColor="#CFCFEA4D"
              borderRadius="12px"
            >
              <Text color="#CFCFEA" fontSize="14px">
                Net earnings:
              </Text>
              <Text
                color={profit > 0 ? 'cyan' : profit < 0 ? 'red' : 'text'}
                fontWeight="extrabold"
                fontSize="22px"
              >
                {address &&
                profit !== 0 &&
                !strategy?.isRetired() &&
                balData.data &&
                balData.data.tokenInfo
                  ? `${profit?.toFixed(balData.data.tokenInfo?.displayDecimals || 2)} ${balData.data.tokenInfo?.name}`
                  : '-'}
              </Text>
            </Box>
          </Flex>

          {strategy && <MobileHarvestTime strategy={strategy} />}
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          padding="16px 8px"
        >
          <Accordion
            index={accordionIndex}
            defaultIndex={[0]}
            onChange={(expandedIndex) => {
              if (Array.isArray(expandedIndex)) {
                setAccordionIndex(expandedIndex[0] ?? 0);
              } else {
                setAccordionIndex(expandedIndex);
              }
            }}
            allowToggle
            width="100%"
            display="flex"
            flexDirection="column"
            gap="10px"
          >
            <AccordionItem border="none">
              <AccordionButton
                bg="dark_bg"
                color="white"
                padding={'16px 16px'}
                _expanded={{ color: '#3EE5C2' }}
                borderWidth="1px"
                borderColor="#2D2D3D"
                borderRadius="8px"
              >
                <Text
                  flex="1"
                  textAlign="left"
                  fontWeight="700"
                  fontSize="14px"
                >
                  Manage
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel padding="0px">
                {strategy && <ManageTab strategy={strategy} isMobile />}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem border="none">
              <AccordionButton
                bg="dark_bg"
                color="white"
                padding={'16px 16px'}
                _expanded={{ color: '#3EE5C2' }}
                borderWidth="1px"
                borderColor="#2D2D3D"
                borderRadius="8px"
              >
                <Text
                  flex="1"
                  textAlign="left"
                  fontWeight="700"
                  fontSize="14px"
                >
                  Risk
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel padding="0px">
                {strategy && <RiskTab strategy={strategy} isMobile />}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem border="none">
              <AccordionButton
                bg="dark_bg"
                color="white"
                padding={'16px 16px'}
                _expanded={{ color: '#3EE5C2' }}
                borderWidth="1px"
                borderColor="#2D2D3D"
                borderRadius="8px"
              >
                <Text
                  flex="1"
                  textAlign="left"
                  fontWeight="700"
                  fontSize="14px"
                >
                  Details
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel padding="0px">
                {strategyCached && (
                  <DetailsTab strategy={strategyCached} isMobile />
                )}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem border="none">
              <AccordionButton
                bg="dark_bg"
                color="white"
                padding={'16px 16px'}
                _expanded={{ color: '#3EE5C2' }}
                borderWidth="1px"
                borderColor="#2D2D3D"
                borderRadius="8px"
              >
                <Text
                  flex="1"
                  textAlign="left"
                  fontWeight="700"
                  fontSize="14px"
                >
                  FAQs
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel padding="0px">
                {strategy && <FAQTab strategy={strategy} isMobile />}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem border="none">
              <AccordionButton
                bg="dark_bg"
                color="white"
                padding={'16px 16px'}
                _expanded={{ color: '#3EE5C2' }}
                borderWidth="1px"
                borderColor="#2D2D3D"
                borderRadius="8px"
              >
                <Text
                  flex="1"
                  textAlign="left"
                  fontWeight="700"
                  fontSize="14px"
                >
                  Transactions
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel padding="0px">
                {strategy && (
                  <TransactionsTab
                    strategy={strategy}
                    txHistory={txHistory}
                    isMobile
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
};

export default Strategy;
