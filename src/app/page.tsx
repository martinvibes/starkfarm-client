'use client';

import tg from '@/assets/tg.svg';
import { useDotButton } from '@/components/EmblaCarouselDotButton';
import Pools from '@/components/Pools';
import Strategies from '@/components/Strategies';
import TVL from '@/components/TVL';
import CONSTANTS from '@/constants';
import { useWindowSize } from '@/utils/useWindowSize';

import {
  Box,
  Center,
  Image as ChakraImage,
  Container,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import mixpanel from 'mixpanel-browser';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const banner_images = [
  // {
  //   desktop: '/banners/strkfarm_braavos.svg',
  //   mobile: '/banners/strkfarm_braavos_mobile.svg',
  //   link: 'https://starknet.quest/quest/235',
  // },
  {
    desktop: '/banners/endur.svg',
    mobile: '/banners/endur_mobile.svg',
    link: 'https://endur.fi/r/strkfarm',
  },
  {
    desktop: '/banners/seed_grant.svg',
    mobile: '/banners/seed_grant_small.jpg',
    link: 'https://x.com/strkfarm/status/1787783906982260881',
  },
];

export default function Home() {
  const [tabIndex, setTabIndex] = useState(0);

  const { address } = useAccount();
  const searchParams = useSearchParams();
  const size = useWindowSize();
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [Autoplay({ playOnInit: true, delay: 8000 })],
  );

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  function setRoute(value: string) {
    router.push(`?tab=${value}`);
  }

  function handleTabsChange(index: number) {
    if (index === 1) {
      setRoute('pools');
    } else {
      setRoute('strategies');
    }
  }

  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  useEffect(() => {
    (async () => {
      const tab = searchParams.get('tab');
      if (tab === 'pools') {
        setTabIndex(1);
      } else {
        setTabIndex(0);
      }
    })();
  }, [searchParams]);

  return (
    <Container
      maxWidth={'1152px'}
      margin={'0 auto'}
      padding={{ base: '15px 10px' }}
    >
      <Box
        padding={{ base: '15px 15px' }}
        borderRadius="10px"
        margin={'20px 0px 10px'}
      >
        <Text
          color={'light_green'}
          fontSize={{ base: '32px', md: '35px' }}
          lineHeight={{ base: '40px', md: '30px' }}
          marginBottom={'10px'}
          textAlign={'center'}
        >
          <b>Starknet&apos;s Yield Powerhouse</b>
          🚀
        </Text>
        <Text
          color="white"
          textAlign={'center'}
          fontSize={{ base: '20px', md: '18px' }}
          lineHeight={{ base: '28px', md: '20px' }}
          marginBottom={'0px'}
        >
          Identify & Invest in the best $STRK rewarding pools and maximize your
          rewards
        </Text>
      </Box>

      <TVL />

      <Tabs
        position="relative"
        variant="unstyled"
        width={'100%'}
        index={tabIndex}
        onChange={handleTabsChange}
        marginTop={'10px'}
      >
        <TabList>
          <Tab
            width={'100%'}
            bg="purple_60p"
            color="lavender_gray"
            fontSize={'14px'}
            fontWeight={'700'}
            borderTopLeftRadius={'8px'}
            _selected={{ bg: 'bright_purple', color: 'black' }}
            onClick={() => {
              mixpanel.track('Strategies opened');
            }}
          >
            Strategies✨
          </Tab>
          <Tab
            width={'100%'}
            bg="purple_60p"
            color="lavender_gray"
            fontSize={'14px'}
            fontWeight={'700'}
            borderTopRightRadius={'8px'}
            _selected={{ bg: 'bright_purple', color: 'black' }}
            onClick={() => {
              mixpanel.track('All pools clicked');
            }}
          >
            Find yields
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            bg="highlight"
            float={'left'}
            width={'100%'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderTopLeftRadius={{ base: '0px', md: '8px' }}
            borderTopRightRadius={{ base: '0px', md: '8px' }}
            borderBottomLeftRadius={{ base: '8px' }}
            borderBottomRightRadius={{ base: '8px' }}
          >
            <Strategies />
          </TabPanel>
          <TabPanel
            bg="highlight"
            width={'100%'}
            float={'left'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderTopLeftRadius={{ base: '0px', md: '8px' }}
            borderTopRightRadius={{ base: '0px', md: '8px' }}
            borderBottomLeftRadius={{ base: '8px' }}
            borderBottomRightRadius={{ base: '8px' }}
          >
            <Pools />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {/* <hr style={{width: '100%', borderColor: '#5f5f5f', float: 'left', margin: '20px 0'}}/> */}
      <Center padding="10px 0" width={'100%'} float={'left'}>
        <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
          <ChakraImage src={tg.src} width="20" margin="0 auto" />
        </Link>
      </Center>
      <Center width={'100%'} float="left">
        <Box
          width="300px"
          maxWidth={'100%'}
          marginTop={'20px'}
          borderTop={'1px solid var(--chakra-colors-highlight)'}
          textAlign={'center'}
          textColor={'color2'}
          padding="10px 0"
          fontSize={'13px'}
        >
          Made with ❤️ on Starknet
        </Box>
      </Center>
    </Container>
  );
}
