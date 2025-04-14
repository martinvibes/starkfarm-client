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
  TabIndicator,
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
      setRoute('strategies');
    } else {
      setRoute('pools');
    }
  }

  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  useEffect(() => {
    (async () => {
      const tab = searchParams.get('tab');
      if (tab === 'pools') {
        setTabIndex(0);
      } else {
        setTabIndex(1);
      }
    })();
  }, [searchParams]);

  return (
    <Container width={'90%'} margin={'0 auto'}>
      <Box padding={'15px 30px'} borderRadius="10px" margin={'20px 0px 10px'}>
        <Text
          color={'light_green'}
          fontSize={{ base: '28px', md: '35px' }}
          lineHeight={'30px'}
          marginBottom={'10px'}
          textAlign={'center'}
        >
          <b>Starknet&apos;s Yield Powerhouse</b>
          🚀
        </Text>
        <Text
          color="white"
          textAlign={'center'}
          fontSize={{ base: '16px', md: '18px' }}
          marginBottom={'0px'}
        >
          Identify & Invest in the best $STRK rewarding pools and maximize your
          rewards
        </Text>
      </Box>

      {/* <Box className="embla" ref={emblaRef} margin={0} width={'100%'}>
        <Box className="embla__container" cursor={'pointer'}>
          {banner_images.map((banner, index) => (
            <Box
              className="embla__slide"
              position="relative"
              height={'auto'}
              key={index}
              padding={'10px'}
            >
              <Link href={banner.link} isExternal>
                <ChakraImage
                  src={
                    (!isMobile && size.width > 450) || size.width == 0
                      ? banner.desktop
                      : banner.mobile
                  }
                  height={'auto'}
                  boxShadow={'none'}
                  width="100%"
                  alt="Banner"
                  style={{ objectFit: 'cover', borderRadius: '10px' }}
                />
              </Link>
            </Box>
          ))}
        </Box>
      </Box> */}

      {/* <Box display="grid" justifyContent="center" gap="1.2rem" mb="1.5rem">
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="flex-end"
          alignItems="center"
          marginRight="calc((2.6rem - 1.4rem) / 2 * -1)"
          gap=".5rem"
        >
          {scrollSnaps.map((_, index) => (
            <Box
              key={index}
              onClick={() => onDotButtonClick(index)}
              width="0.8rem"
              height="0.8rem"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              backgroundColor={index === selectedIndex ? '#4D59E8' : 'black'}
              padding="0"
              margin="0"
              border="1px solid #373A5D"
              textDecoration="none"
              appearance="none"
            />
          ))}
        </Box>
      </Box> */}

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
            color={'silver_gray'}
            _selected={{ color: 'light_green', fontWeight: 'bold' }}
            onClick={() => {
              mixpanel.track('All pools clicked');
            }}
          >
            Find yields
          </Tab>
          <Tab
            color={'silver_gray'}
            _selected={{ color: 'light_green', fontWeight: 'bold' }}
            onClick={() => {
              mixpanel.track('Strategies opened');
            }}
          >
            Strategies✨
          </Tab>
        </TabList>
        <TabIndicator
          mt="-1.5px"
          height="3px"
          bg="light_green"
          color="color1"
          borderRadius="1px"
          boxShadow={'0px 0px 8px 0px #3EE5C2'}
        />
        <TabPanels>
          <TabPanel
            bg="highlight"
            width={'100%'}
            float={'left'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderRadius={'8px'}
          >
            <Pools />
          </TabPanel>
          <TabPanel
            bg="highlight"
            float={'left'}
            width={'100%'}
            borderWidth={'1px'}
            borderColor={'slate_blue'}
            borderRadius={'8px'}
          >
            <Strategies />
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
