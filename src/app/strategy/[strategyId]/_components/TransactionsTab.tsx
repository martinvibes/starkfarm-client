import {
  Box,
  Flex,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
} from '@chakra-ui/react';
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useAccount } from '@starknet-react/core';

import {
  capitalize,
  getTokenInfoFromAddr,
  shortAddress,
  timeAgo,
} from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { StrategyInfo } from '@/store/strategies.atoms';

interface TransactionsTabProps {
  strategy: StrategyInfo<any>;
  // txHistoryResult: AtomWithQueryResult<TxHistory, Error>;
  txHistory: {
    findManyInvestment_flows: {
      amount: string;
      timestamp: number;
      type: string;
      txHash: string;
      asset: string;
      __typename: 'Investment_flows';
    }[];
  };
}

export function TransactionsTab(props: TransactionsTabProps) {
  const { address } = useAccount();
  const { strategy, txHistory } = props;

  return (
    <Flex flexDirection={'column'} padding={'24px 0px'} gap={'24px'}>
      <Flex flexDirection={'column'} gap={'8px'}>
        <Text fontSize={'24px'} color={'white'} fontWeight={'600'}>
          Transaction history
        </Text>

        {!strategy.settings.isTransactionHistDisabled && (
          <Text fontSize={'14px'} color={'border_light'}>
            There may be delays fetching data. If your transaction {`isn't`}{' '}
            found, try again later.
          </Text>
        )}
      </Flex>

      <Flex gap={'16px'}>
        {address ? (
          <>
            {!strategy.settings.isTransactionHistDisabled &&
              txHistory.findManyInvestment_flows.length !== 0 && (
                <>
                  <TableContainer width={'100%'}>
                    <Table
                      variant="unstyled"
                      borderWidth={'1px'}
                      borderColor={'#2D2D3D'}
                      sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        'border-collapse': 'separate',
                        'border-spacing': '0px',
                      }}
                    >
                      <Thead
                        display={{ base: 'none', md: 'table-header-group' }}
                        bg={'color_3'}
                      >
                        <Tr>
                          <Th
                            width={'50px'}
                            color={'white'}
                            borderColor={'slate_blue'}
                            fontSize={'14px'}
                            fontWeight={'600'}
                            textTransform={'capitalize'}
                          >
                            #
                          </Th>
                          <Th
                            color={'white'}
                            borderRightWidth={'1px'}
                            borderColor={'slate_blue'}
                            fontSize={'14px'}
                            fontWeight={'600'}
                            textTransform={'capitalize'}
                          >
                            Amount
                          </Th>
                          <Th
                            color={'white'}
                            borderRightWidth={'1px'}
                            borderColor={'slate_blue'}
                            fontSize={'14px'}
                            fontWeight={'600'}
                            textTransform={'capitalize'}
                          >
                            Transaction type
                          </Th>
                          <Th
                            color={'white'}
                            borderRightWidth={'1px'}
                            borderColor={'slate_blue'}
                            fontSize={'14px'}
                            fontWeight={'600'}
                            textTransform={'capitalize'}
                          >
                            Wallet address
                          </Th>
                          <Th
                            color={'white'}
                            borderRightWidth={'1px'}
                            borderColor={'slate_blue'}
                            fontSize={'14px'}
                            fontWeight={'600'}
                            textTransform={'capitalize'}
                          >
                            Time
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {txHistory.findManyInvestment_flows.map((tx, index) => {
                          const token = getTokenInfoFromAddr(tx.asset);
                          const decimals = token?.decimals;

                          return (
                            <Tr
                              key={index}
                              border={'none'}
                              borderBottom={'1px solid #000000'}
                            >
                              <Td color={'text'} fontSize={'14px'}>
                                {index + 1}.
                              </Td>
                              <Td color={'text'} fontSize={'14px'}>
                                {Number(
                                  new MyNumber(
                                    tx.amount,
                                    decimals!,
                                  ).toEtherToFixedDecimals(
                                    token.displayDecimals,
                                  ),
                                ).toLocaleString()}{' '}
                                {token?.name}
                              </Td>
                              <Td color={'text'} fontSize={'14px'}>
                                <Flex alignItems={'center'} gap={'8px'}>
                                  {tx.type === 'deposit' ? (
                                    <Box
                                      bg={'light_green'}
                                      padding={'4px'}
                                      borderRadius={'50%'}
                                      width={'24px'}
                                      height={'24px'}
                                      display={'flex'}
                                      alignItems={'center'}
                                      justifyContent={'center'}
                                    >
                                      <ArrowDownIcon color={'black'} />
                                    </Box>
                                  ) : (
                                    <Box
                                      bg={'red_2'}
                                      padding={'4px'}
                                      borderRadius={'50%'}
                                      width={'24px'}
                                      height={'24px'}
                                      display={'flex'}
                                      alignItems={'center'}
                                      justifyContent={'center'}
                                    >
                                      <ArrowUpIcon color={'black'} />
                                    </Box>
                                  )}

                                  {capitalize(tx.type)}
                                </Flex>
                              </Td>
                              <Td color={'text'} fontSize={'14px'}>
                                <Text
                                  width={'100%'}
                                  fontWeight={'600'}
                                  color={'border_light'}
                                >
                                  <Link
                                    href={`https://starkscan.co/tx/${tx.txHash}`}
                                    target="_blank"
                                  >
                                    {shortAddress(tx.txHash)}{' '}
                                    <ExternalLinkIcon />
                                  </Link>
                                </Text>
                              </Td>
                              <Td color={'silver_gray'} fontSize={'14px'}>
                                <Text width={'100%'}>
                                  {timeAgo(new Date(tx.timestamp * 1000))}
                                </Text>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>
              )}
          </>
        ) : (
          <Text fontSize={'14px'} textAlign={'center'} color="light_grey">
            Connect your wallet to view transaction history
          </Text>
        )}

        {/* If no filtered tx */}
        {address &&
          !strategy.settings.isTransactionHistDisabled &&
          txHistory.findManyInvestment_flows.length === 0 && (
            <Text fontSize={'14px'} textAlign={'center'} color="light_grey">
              No transactions found
            </Text>
          )}

        {strategy.settings.isTransactionHistDisabled && (
          <Text
            fontSize={'14px'}
            textAlign={'center'}
            color="light_grey"
            marginTop={'20px'}
          >
            Transaction history is not available for this strategy yet. If
            enabled in future, will include the entire history.
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
