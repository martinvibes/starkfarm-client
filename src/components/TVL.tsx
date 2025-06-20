import { addressAtom } from '@/store/claims.atoms';
import { referralCodeAtom } from '@/store/referral.store';
import { strategiesAtom } from '@/store/strategies.atoms';
import { dAppStatsAtom, userStatsAtom } from '@/store/utils.atoms';
import { copyReferralLink, getHosturl } from '@/utils';
import { CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Card,
  Grid,
  GridItem,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import React from 'react';

const TVL: React.FC = () => {
  const _strategies = useAtomValue(strategiesAtom);
  const { data, isPending } = useAtomValue(dAppStatsAtom);
  const { data: userData, isPending: userStatsPending } =
    useAtomValue(userStatsAtom);

  const address = useAtomValue(addressAtom);
  const referralCode = useAtomValue(referralCodeAtom);

  const formattedTvlData = (tvlData: number) => {
    if (tvlData >= 1000000) {
      return `${(tvlData / 1000000).toFixed(2)}m`;
    } else if (tvlData >= 1000) {
      return `${(tvlData / 1000).toFixed(2)}k`;
    }
    return `${tvlData.toString()}`;
  };

  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1, 1fr)', md: 'repeat(3, 1fr)' }}
      gap="2"
      width="100%"
    >
      <GridItem display="flex">
        <Card
          width={'100%'}
          padding={'15px 30px'}
          color={'white'}
          bg={'mycard'}
          // borderWidth={'1px'}
          // borderColor={'color_3'}
        >
          <Stat>
            <StatLabel fontSize={{ base: '18px' }} color={'purple_tint'}>
              Total Value locked (TVL)
            </StatLabel>
            <StatNumber fontSize={{ base: '24px' }} color={'text'}>
              $
              {isPending ? (
                <Spinner size="sm" color="white" marginLeft={'5px'} />
              ) : data !== undefined ? (
                formattedTvlData(Number(data.tvl))
              ) : (
                '0'
              )}
            </StatNumber>
          </Stat>
        </Card>
      </GridItem>

      <GridItem display="flex">
        <Card
          width={'100%'}
          padding={'15px 30px'}
          color={'white'}
          bg={'mycard'}
          // borderWidth={'1px'}
          // borderColor={'color_3'}
        >
          <Stat>
            <StatLabel fontSize={{ base: '18px' }} color={'purple_tint'}>
              Your holdings
            </StatLabel>
            <StatNumber fontSize={{ base: '24px' }} color={'text'}>
              $
              {userStatsPending ? (
                <Spinner size="sm" color="white" marginLeft={'5px'} />
              ) : !userData ? (
                0
              ) : (
                Number(userData?.holdingsUSD?.toFixed(2)).toLocaleString()
              )}
            </StatNumber>
          </Stat>
        </Card>
      </GridItem>

      <GridItem display="flex">
        <Card
          width={'100%'}
          padding={'15px 30px'}
          color={'white'}
          bg={'mycard'}
          // borderWidth={'1px'}
          // borderColor={'color_3'}
        >
          <Stat>
            <StatLabel fontSize={{ base: '18px' }} color={'purple_tint'}>
              Your referral link{' '}
              <Tooltip label="Learn more">
                {/* TODO: update the url */}
                <Link
                  href={`https://docs.${getHosturl()}/p/community/referral-campaign`}
                  target="_blank"
                >
                  (i)
                </Link>
              </Tooltip>
            </StatLabel>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {address ? (
                !referralCode ? (
                  <Spinner size="sm" color="white" marginTop={'8px'} />
                ) : (
                  <StatNumber
                    fontSize={{ base: '20px' }}
                    textDecoration="underline"
                    fontWeight="600"
                    cursor={'pointer'}
                    onClick={() => {
                      copyReferralLink(referralCode);
                    }}
                  >
                    {referralCode}
                  </StatNumber>
                )
              ) : (
                <Tooltip label="Connect wallet">
                  <StatNumber fontSize={{ base: '20px' }} fontWeight="600">
                    -
                  </StatNumber>
                </Tooltip>
              )}

              {address && (
                <CopyIcon
                  cursor="pointer"
                  onClick={() => {
                    copyReferralLink(referralCode);
                  }}
                />
              )}
            </Box>
          </Stat>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default TVL;
