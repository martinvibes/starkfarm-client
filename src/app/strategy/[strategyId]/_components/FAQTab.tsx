import {
  Box,
  Flex,
  Text,
  AccordionPanel,
  AccordionButton,
  Accordion,
  AccordionItem,
  AccordionIcon,
  Button,
  Link,
} from '@chakra-ui/react';
import { StrategyInfo } from '@/store/strategies.atoms';
import CONSTANTS from '@/constants';

interface FAQTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function FAQTab(props: FAQTabProps) {
  const { strategy } = props;

  return (
    <Flex flexDirection={'column'} padding={'24px 16px'} gap={'24px'}>
      <Text
        fontSize={{ base: '16px', md: '24px' }}
        color={'white'}
        fontWeight={'600'}
      >
        Get your questions answered
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }} width={'100%'} gap={5}>
        <Flex flexDirection={'column'} width={'100%'} gap={'16px'}>
          {!strategy.metadata.faqs ||
            (strategy.metadata.faqs.length == 0 && (
              <Text fontSize={'14px'} color={'text_secondary'}>
                No FAQs at the moment
              </Text>
            ))}
          <Accordion
            width={'100%'}
            display={'flex'}
            flexDirection={'column'}
            gap={'16px'}
            allowToggle={true}
          >
            {strategy.metadata.faqs &&
              strategy.metadata.faqs.length > 0 &&
              strategy.metadata.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  borderRadius={'lg'}
                  border="none"
                  bg={'mycard'}
                >
                  <Text
                    fontSize={'14px'}
                    fontWeight={'500'}
                    color={'text_primary'}
                  >
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Text>
                  <AccordionPanel
                    pb={4}
                    fontSize={'14px'}
                    fontWeight={'400'}
                    lineHeight={'20px'}
                    color={'text_secondary'}
                  >
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        </Flex>

        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          alignSelf={'center'}
          gap={'16px'}
          marginLeft={'auto'}
          marginRight={'auto'}
          width={{ base: '100%', md: '50%' }}
        >
          <Flex
            flexDirection={'column'}
            gap={'8px'}
            padding={'10px'}
            borderRadius={'8px'}
            bg="mycard_dark"
          >
            <Text
              fontSize={'14px'}
              fontWeight={'500'}
              color={'text_secondary'}
              textAlign={'center'}
            >
              For more queries reach out to us on Telegram
            </Text>
            <Text
              fontSize={'14px'}
              fontWeight={'400'}
              color={'text_secondary'}
              textAlign={'center'}
            >
              Our team will respond to you soon!
            </Text>
          </Flex>

          <Link href={CONSTANTS.COMMUNITY_TG}>
            <Button
              bg={'transparent'}
              padding={'12px 20px'}
              borderRadius={'100px'}
              borderWidth={'1px'}
              borderColor={'purple'}
              color={'purple'}
              fontSize={'14px'}
              fontWeight={'700'}
              _hover={{
                bg: 'mycard_dark',
                color: 'purple',
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
