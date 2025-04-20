import { DUMMY_BAL_ATOM } from '@/store/balance.atoms';
import { StrategyInfo } from '@/store/strategies.atoms';
import { StrategyTxProps } from '@/store/transactions.atom';
import {
  DepositActionInputs,
  IStrategyActionHook,
  TokenInfo,
} from '@/strategies/IStrategy';
import { MyMenuItemProps, MyMenuListProps } from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Image,
  Image as ImageC,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  Progress,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { useAtomValue } from 'jotai';
import mixpanel from 'mixpanel-browser';
import { useEffect, useMemo, useState } from 'react';
import LoadingWrap from './LoadingWrap';
import TxButton from './TxButton';
import CONSTANTS, { provider } from '@/constants';

interface DepositProps {
  strategy: StrategyInfo<any>;
  // ? If you want to add more button text, you can add here
  // ? @dev ensure below actionType is updated accordingly
  buttonText: 'Deposit' | 'Redeem';
  callsInfo: (inputs: DepositActionInputs) => IStrategyActionHook[];
}

export default function Deposit(props: DepositProps) {
  const { address } = useAccount();
  const [dirty, setDirty] = useState(false);
  const [isMaxClicked, setIsMaxClicked] = useState(false);

  const tvlInfo = useAtomValue(props.strategy.tvlAtom);

  // This is the selected market token
  const [selectedMarket, setSelectedMarket] = useState(
    props.callsInfo({
      amount: MyNumber.fromZero(),
      address: address || '0x0',
      provider,
      isMax: isMaxClicked,
    })[0].tokenInfo,
  );

  // This is processed amount stored in MyNumber format and meant for sending tx
  const [amount, setAmount] = useState(
    MyNumber.fromEther('0', selectedMarket.decimals),
  );

  // This is used to store the raw amount entered by the user
  const [rawAmount, setRawAmount] = useState('');

  const isDeposit = useMemo(() => props.buttonText === 'Deposit', [props]);

  // use to maintain tx history and show toasts
  const txInfo: StrategyTxProps = useMemo(() => {
    return {
      strategyId: props.strategy.id,
      actionType: isDeposit ? 'deposit' : 'withdraw',
      amount,
      tokenAddr: selectedMarket.token,
    };
  }, [amount, props]);

  // Function to reset the input fields to their initial state
  const resetDepositForm = () => {
    setAmount(MyNumber.fromEther('0', selectedMarket.decimals));
    setRawAmount('');
    setDirty(false);
  };

  // constructs tx calls
  const { calls, actions } = useMemo(() => {
    const actions = props.callsInfo({
      amount,
      address: address || '0x0',
      provider,
      isMax: isMaxClicked,
    });
    const hook = actions.find((a) => a.tokenInfo.name === selectedMarket.name);
    if (!hook) return { calls: [], actions };
    return { calls: hook.calls, actions };
  }, [selectedMarket, amount, address, provider, isMaxClicked]);

  const balData = useAtomValue(
    actions.find((a) => a.tokenInfo.name === selectedMarket.name)
      ?.balanceAtom || DUMMY_BAL_ATOM,
  );
  const balance = useMemo(() => {
    return balData.data?.amount || MyNumber.fromZero();
  }, [balData]);
  // const { balance, isLoading, isError } = useERC20Balance(selectedMarket);

  const maxAmount: MyNumber = useMemo(() => {
    const currentTVl = tvlInfo.data?.amount || MyNumber.fromZero();
    const maxAllowed =
      props.buttonText == 'Deposit' && props.strategy.settings.maxTVL != 0
        ? props.strategy.settings.maxTVL - Number(currentTVl.toEtherStr())
        : Number(balance.toEtherToFixedDecimals(8));
    const adjustedMaxAllowed = MyNumber.fromEther(
      maxAllowed.toFixed(6),
      selectedMarket.decimals,
    );
    let reducedBalance = balance;
    if (props.buttonText === 'Deposit') {
      if (selectedMarket.name === 'STRK') {
        reducedBalance = balance.subtract(
          MyNumber.fromEther('1.5', selectedMarket.decimals),
        );
      } else if (selectedMarket.name === 'ETH') {
        reducedBalance = balance.subtract(
          MyNumber.fromEther('0.001', selectedMarket.decimals),
        );
      }
    }
    console.log('Deposit:: reducedBalance2', reducedBalance.toEtherStr());
    const min = MyNumber.min(reducedBalance, adjustedMaxAllowed);
    return MyNumber.max(min, MyNumber.fromEther('0', selectedMarket.decimals));
  }, [balance, props.strategy, selectedMarket]);

  const isTVLFull = useMemo(() => {
    return (
      props.strategy.settings.maxTVL != 0 &&
      tvlInfo.data?.amount.compare(
        props.strategy.settings.maxTVL.toFixed(6),
        'gt',
      )
    );
  }, [tvlInfo]);

  useEffect(() => {
    if (isMaxClicked) {
      setRawAmount(maxAmount.toEtherStr());
      setAmount(maxAmount);
    }
  }, [maxAmount, isMaxClicked]);

  function BalanceComponent(props: { token: TokenInfo }) {
    return (
      <Box textAlign={'right'}>
        <Text color={'silver_gray'}>Wallet balance </Text>
        <LoadingWrap
          isLoading={balData.isLoading || balData.isPending}
          isError={balData.isError}
          skeletonProps={{
            height: '10px',
            width: '50px',
            float: 'right',
            marginTop: '8px',
            marginLeft: '5px',
          }}
          iconProps={{
            marginLeft: '5px',
            boxSize: '15px',
          }}
        >
          <Tooltip label={balance.toEtherStr()}>
            <Text fontSize={'18px'} fontWeight={'500'} color="text">
              {balance.toEtherToFixedDecimals(4)} {props.token.name}
            </Text>
          </Tooltip>
        </LoadingWrap>
      </Box>
    );
  }
  return (
    <Box>
      <Grid templateColumns="repeat(5, 1fr)" gap={6}>
        <GridItem colSpan={2}>
          <Menu>
            <MenuButton
              as={Button}
              height={'100%'}
              rightIcon={<ChevronDownIcon width={'20px'} height={'20px'} />}
              width={'200px'}
              bg={'transparent'}
              borderColor={'slate_blue'}
              borderWidth={'1px'}
              color="border_light"
              fontSize={'16px'}
              fontWeight={'500'}
              padding={'10px 16px'}
              textAlign={'left'}
              _hover={{
                bg: 'transparent',
              }}
            >
              <Flex alignItems={'center'}>
                {balData.data && balData.data.tokenInfo && (
                  <Image
                    src={
                      CONSTANTS.LOGOS[
                        selectedMarket.name as keyof typeof CONSTANTS.LOGOS
                      ]
                    }
                    alt=""
                    width={'20px'}
                    marginRight="5px"
                  />
                )}
                <Text fontSize={'16px'} fontWeight={'500'} color="border_light">
                  {balData.data && balData.data.tokenInfo
                    ? balData.data.tokenInfo.name
                    : '-'}
                </Text>
              </Flex>
            </MenuButton>
            <MenuList {...MyMenuListProps}>
              {actions.map((dep) => (
                <MenuItem
                  key={dep.tokenInfo.name}
                  {...MyMenuItemProps}
                  onClick={() => {
                    if (selectedMarket.name !== dep.tokenInfo.name) {
                      setSelectedMarket(dep.tokenInfo);
                      setAmount(new MyNumber('0', dep.tokenInfo.decimals));
                      setDirty(false);
                      setRawAmount('');
                    }
                  }}
                >
                  <Center>
                    <ImageC
                      src={
                        CONSTANTS.LOGOS[
                          dep.tokenInfo.name as keyof typeof CONSTANTS.LOGOS
                        ]
                      }
                      alt=""
                      width={'20px'}
                      marginRight="5px"
                    />{' '}
                    {dep.tokenInfo.name}
                  </Center>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </GridItem>
        <GridItem colSpan={3}>
          <BalanceComponent token={selectedMarket} />
        </GridItem>
      </Grid>

      {/* add min max validations and show err */}
      <NumberInput
        min={0}
        max={parseFloat(maxAmount.toEtherStr())}
        step={parseFloat(selectedMarket.stepAmount.toEtherStr())}
        color={'white'}
        bg={'transparent'}
        borderRadius={'10px'}
        borderColor={'slate_blue'}
        borderWidth={'1px'}
        onChange={(value) => {
          if (value && Number(value) > 0)
            setAmount(MyNumber.fromEther(value, selectedMarket.decimals));
          else {
            setAmount(new MyNumber('0', selectedMarket.decimals));
          }
          setIsMaxClicked(false);
          setRawAmount(value);
          setDirty(true);
          mixpanel.track('Enter amount', {
            strategyId: props.strategy.id,
            strategyName: props.strategy.name,
            buttonText: props.buttonText,
            amount: amount.toEtherStr(),
            token: selectedMarket.name,
            maxAmount: maxAmount.toEtherStr(),
            address,
          });
        }}
        marginTop={'20px'}
        keepWithinRange={false}
        clampValueOnBlur={false}
        value={rawAmount}
        isDisabled={maxAmount.isZero()}
      >
        <NumberInputField
          border={'0px'}
          borderRadius={'10px'}
          placeholder="Amount"
          paddingRight="60px"
          color={'white'}
        />
        <Button
          size={'sm'}
          position="absolute"
          right="8px"
          top="50%"
          transform="translateY(-50%)"
          color="white"
          bg="transparent"
          padding="0 8px"
          height="24px"
          fontSize={'14px'}
          fontWeight={'500'}
          _hover={{
            bg: 'transparent',
            color: 'white',
          }}
          onClick={() => {
            setAmount(maxAmount);
            setRawAmount(maxAmount.toEtherStr());
            setIsMaxClicked(true);
            mixpanel.track('Chose max amount', {
              strategyId: props.strategy.id,
              strategyName: props.strategy.name,
              buttonText: props.buttonText,
              amount: amount.toEtherStr(),
              token: selectedMarket.name,
              maxAmount: maxAmount.toEtherStr(),
              address,
            });
          }}
        >
          MAX
        </Button>
      </NumberInput>

      {amount.isZero() && dirty && (
        <Text marginTop="2px" marginLeft={'7px'} color="red" fontSize={'13px'}>
          Require amount {'>'} 0
        </Text>
      )}

      {amount.compare(maxAmount.toEtherStr(), 'gt') && (
        <Text marginTop="2px" marginLeft={'7px'} color="red" fontSize={'13px'}>
          Amount to be less than {maxAmount.toEtherToFixedDecimals(2)}
        </Text>
      )}

      <Center marginTop={'20px'}>
        <TxButton
          txInfo={txInfo}
          buttonText={props.buttonText}
          text={`${props.buttonText}: ${amount.toEtherToFixedDecimals(selectedMarket.displayDecimals)} ${selectedMarket.name}`}
          calls={calls}
          buttonProps={{
            isDisabled:
              amount.isZero() || amount.compare(maxAmount.toEtherStr(), 'gt'),
          }}
          selectedMarket={selectedMarket}
          strategy={props.strategy}
          resetDepositForm={resetDepositForm}
        />
      </Center>

      <Flex justifyContent={'space-between'} marginTop={'30px'}>
        <Text fontSize={'14px'} fontWeight={'400'} color="silver_gray">
          Fees
        </Text>
        <Text fontSize={'14px'} color="border_light">
          No additional fees by STRKFarm
        </Text>
      </Flex>

      {!props.strategy.isRetired() && props.strategy.settings.maxTVL !== 0 && (
        <Flex
          flexDirection={'column'}
          width="100%"
          marginTop={'15px'}
          gap={'6px'}
        >
          <Flex justifyContent={'flex-end'}>
            <Text color="border_light" fontSize={'16px'} fontWeight={'500'}>
              {!tvlInfo || !tvlInfo?.data ? (
                <Spinner size="2xs" />
              ) : (
                Number(tvlInfo.data?.amount.toFixedStr(2)).toLocaleString()
              )}
            </Text>
            <Text color={'silver_gray'} fontSize={'16px'} fontWeight={'500'}>
              {' '}
              {' / '}
            </Text>
            <Text color={'silver_gray'} fontSize={'16px'} fontWeight={'500'}>
              {props.strategy.settings.maxTVL.toLocaleString()}{' '}
              {selectedMarket.name}
            </Text>
          </Flex>
          <Progress
            colorScheme="teal"
            bg="border_light_3p"
            borderRadius={'6px'}
            borderWidth={'1px'}
            borderColor={'light_green_30p'}
            value={
              (100 *
                (Number(tvlInfo.data?.amount.toEtherStr()) ||
                  props.strategy.settings.maxTVL)) /
              props.strategy.settings.maxTVL
            }
            isIndeterminate={!tvlInfo || !tvlInfo?.data}
          />
          {isTVLFull && isDeposit && (
            <Alert
              status="warning"
              bg="bg"
              marginTop={'20px'}
              borderRadius={'10px'}
            >
              <AlertIcon />
              <Text fontSize={'12px'} color={'color2'}>
                TVL limit reached. Please wait for increase in limits.
              </Text>
            </Alert>
          )}
          {/* {tvlInfo.isError ? 1 : 0}{tvlInfo.isLoading ? 1 : 0} {JSON.stringify(tvlInfo.error)} */}
        </Flex>
      )}
    </Box>
  );
}
