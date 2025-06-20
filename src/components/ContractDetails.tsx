import { Flex, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { StrategyInfo } from '@/store/strategies.atoms';

export function ContractDetails(props: { strategy: StrategyInfo<any> }) {
  return (
    <Flex alignItems={'center'} height={'40px'}>
      <Link
        color={'text_secondary'}
        fontSize={'14px'}
        fontWeight={'500'}
        lineHeight={'100%'}
        textDecoration={'none'}
      >
        Contract details <ExternalLinkIcon marginBottom={'3px'} />
      </Link>
    </Flex>
  );
}
