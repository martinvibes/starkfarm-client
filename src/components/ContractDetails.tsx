import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Image,
  Link,
  Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { StrategyInfo } from '@/store/strategies.atoms';
import CONSTANTS from '@/constants';
import shield from '@/assets/shield.svg';

export function ContractDetails(props: { strategy: StrategyInfo<any> }) {
  const { strategy } = props;
  return (
    <Flex alignItems={'center'} direction={'column'} height={'40px'} gap={5}>
      {props.strategy.metadata.contractDetails.length > 0 && (
        <Accordion width={'100%'} allowToggle={true}>
          <AccordionItem borderRadius={'lg'} border="none" bg={'mycard_light'}>
            <AccordionButton flex={1} color={'text_secondary'}>
              Contracts Info
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              pb={4}
              fontSize={'14px'}
              fontWeight={'400'}
              lineHeight={'20px'}
              color={'text_secondary'}
            >
              {props.strategy.metadata.contractDetails.map(
                (contract, index) => (
                  <Flex key={index} fontSize={'14px'} gap={2}>
                    <Text>
                      {index + 1}. {contract.name}
                    </Text>
                    <a
                      href={`${CONSTANTS.BLOCK_EXPLORER}/contract/${contract.address}`}
                    >
                      <ExternalLinkIcon />
                    </a>
                  </Flex>
                ),
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      <Flex gap={3} width={'100%'} justifyContent={'flex-start'}>
        {strategy.metadata.docs && (
          <Link
            href={strategy.metadata.docs}
            target="_blank"
            color={'text_secondary'}
            textAlign={'left'}
            width={'auto'}
            fontSize={'14px'}
          >
            Docs
          </Link>
        )}
        {strategy.metadata.auditUrl && (
          <Link
            href={strategy.metadata.auditUrl}
            target="_blank"
            color={'text_secondary'}
            textAlign={'left'}
            width={'auto'}
            fontSize={'14px'}
            display={'flex'}
            gap={1}
          >
            <Image
              src={shield.src}
              alt="badge"
              filter={'brightness(0) invert(0.7)'}
              width={'11px'}
            />
            <span>Audit</span>
          </Link>
        )}
      </Flex>
    </Flex>
  );
}
