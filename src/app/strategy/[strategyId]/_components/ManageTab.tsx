import {
  Badge,
  Flex,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
} from '@chakra-ui/react';
import React from 'react';

import { StrategyInfo } from '@/store/strategies.atoms';
import { getRiskExplaination } from '@strkfarm/sdk';
import { TokenDeposit } from './TokenDeposit';

interface ManageTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function ManageTab(props: ManageTabProps) {
  const { strategy, isMobile } = props;

  if (isMobile) {
    return (
      <Flex flexDirection={'column'} padding={'10px 0px'} gap={'10px'}>
        <Flex
          width={'100%'}
          borderRadius={'8px'}
          borderWidth={'1px'}
          borderColor={'slate_blue'}
        >
          {!strategy ||
            (strategy.isSingleTokenDepositView && (
              <TokenDeposit strategy={strategy} isDualToken={false} />
            ))}
          {strategy && !strategy.isSingleTokenDepositView && (
            <TokenDeposit strategy={strategy} isDualToken={true} />
          )}
        </Flex>

        <Flex
          width={'100%'}
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
              Deposit USDC to automatically loop funds between zkLend and
              Nostra.
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
            <ListItem>
              Withdraw anytime by redeeming your NFT for USDC.
            </ListItem>
          </UnorderedList>

          <Flex alignItems={'center'} gap={'8px'} flexWrap={'wrap'}>
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
      </Flex>
    );
  }

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
        {!strategy ||
          (strategy.isSingleTokenDepositView && (
            <TokenDeposit strategy={strategy} isDualToken={false} />
          ))}
        {strategy && !strategy.isSingleTokenDepositView && (
          <TokenDeposit strategy={strategy} isDualToken={true} />
        )}
      </Flex>
    </Flex>
  );
}
