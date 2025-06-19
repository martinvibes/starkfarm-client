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

interface FAQTabProps {
  strategy: StrategyInfo<any>;
  isMobile?: boolean;
}

export function FAQTab(props: FAQTabProps) {
  const { strategy, isMobile } = props;

  if (isMobile) {
    return (
      <Flex flexDirection="column" gap="16px" width="100%">
        <Box
          width="100%"
          borderRadius="8px"
          borderWidth="1px"
          borderColor="slate_blue"
          bg="bg_2"
          p={4}
        >
          <Text fontSize="18px" color="white" fontWeight="600" mb={2}>
            Get to know about all your doubts
          </Text>
          <Accordion width={'100%'} allowToggle>
            {strategy.metadata.faqs && strategy.metadata.faqs.length > 0 ? (
              strategy.metadata.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  borderRadius={'8px'}
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                  mb={2}
                >
                  <AccordionButton>
                    <Box
                      flex="1"
                      textAlign="left"
                      fontSize="14px"
                      fontWeight="500"
                      color="border_light"
                    >
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} fontSize="14px" color="silver_gray">
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))
            ) : (
              <Text fontSize={'14px'} color={'silver_gray'}>
                No FAQs at the moment
              </Text>
            )}
          </Accordion>
        </Box>
        <Box
          width="100%"
          borderRadius="8px"
          borderWidth="1px"
          borderColor="slate_blue"
          bg="bg_2"
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          <Text
            fontSize={'14px'}
            fontWeight={'500'}
            color={'border_light'}
            textAlign={'center'}
          >
            For more queries reach out to us on Telegram
          </Text>
          <Text
            fontSize={'14px'}
            fontWeight={'400'}
            color={'silver_gray'}
            textAlign={'center'}
          >
            Our team will respond to you soon!
          </Text>
          <Link href="https://t.me/+HQ_eHaXmF-1lZDc1">
            <Button
              bg={'transparent'}
              padding={'12px 20px'}
              borderRadius={'100px'}
              borderWidth={'1px'}
              borderColor={'color_7'}
              color={'color_7'}
              fontSize={'14px'}
              fontWeight={'700'}
              _hover={{ bg: 'transparent', color: 'color_7' }}
            >
              Connect on Telegram
            </Button>
          </Link>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex flexDirection={'column'} padding={'24px 0px'} gap={'24px'}>
      <Text fontSize={'24px'} color={'white'} fontWeight={'600'}>
        Get to know about all your doubts
      </Text>

      <Flex>
        <Flex flexDirection={'column'} width={'696px'} gap={'16px'}>
          {!strategy.metadata.faqs && (
            <Text fontSize={'14px'} color={'silver_gray'}>
              No FAQs at the moment
            </Text>
          )}
          <Accordion
            width={'100%'}
            display={'flex'}
            flexDirection={'column'}
            gap={'16px'}
          >
            {strategy.metadata.faqs &&
              strategy.metadata.faqs.length > 0 &&
              strategy.metadata.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  borderRadius={'8px'}
                  borderWidth={'1px'}
                  borderColor={'slate_blue'}
                >
                  <Text
                    fontSize={'14px'}
                    fontWeight={'500'}
                    color={'border_light'}
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
                    color={'silver_gray'}
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
        >
          <Flex
            flexDirection={'column'}
            width={'415px'}
            gap={'8px'}
            padding={'10px'}
            borderWidth={'1px'}
            borderRadius={'8px'}
            borderColor={'slate_blue'}
          >
            <Text
              fontSize={'14px'}
              fontWeight={'500'}
              color={'border_light'}
              textAlign={'center'}
            >
              For more queries reach out to us on Telegram
            </Text>
            <Text
              fontSize={'14px'}
              fontWeight={'400'}
              color={'silver_gray'}
              textAlign={'center'}
            >
              Our team will respond to you soon!
            </Text>
          </Flex>

          <Link href="https://t.me/+HQ_eHaXmF-1lZDc1">
            <Button
              bg={'transparent'}
              padding={'12px 20px'}
              borderRadius={'100px'}
              borderWidth={'1px'}
              borderColor={'color_7'}
              color={'color_7'}
              fontSize={'14px'}
              fontWeight={'700'}
              _hover={{
                bg: 'transparent',
                color: 'color_7',
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
