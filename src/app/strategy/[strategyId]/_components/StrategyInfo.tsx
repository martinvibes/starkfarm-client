import { Avatar, AvatarGroup, Box, Flex, Image, Text } from '@chakra-ui/react';
import shield from '@/assets/shield.svg';
import { StrategyInfo } from '@/store/strategies.atoms';

export function StrategyInfoComponent(props: { strategy: StrategyInfo<any> }) {
  const { strategy } = props;

  return (
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
        {strategy && strategy.metadata.depositTokens.length == 0 && (
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
    </Flex>
  );
}
