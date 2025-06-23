'use client';

import Navbar, { getConnectors } from '@/components/Navbar';
import { MY_STORE } from '@/store';
import {
  Center,
  ChakraBaseProvider,
  Container,
  Flex,
  extendTheme,
} from '@chakra-ui/react';
import { mainnet } from '@starknet-react/chains';
import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { Provider as JotaiProvider } from 'jotai';
import mixpanel from 'mixpanel-browser';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Toaster } from 'react-hot-toast';
import { RpcProviderOptions, constants } from 'starknet';

import { Inter } from 'next/font/google';
import { isMobile } from 'react-device-detect';
const inter = Inter({ subsets: ['latin'] });

mixpanel.init('118f29da6a372f0ccb6f541079cad56b');

const theme = extendTheme({
  colors: {
    transparent: 'rgba(0, 0, 0, 0)',
    opacity_50p: 'rgba(0, 0, 0, 0.5)',
    disabled_text: '#818181',
    disabled_bg: '#5f5f5f',

    highlight: '#303136',
    purple: '#9069F0',
    purple_60p: '#6F5CA599',
    purple_hover: '#4C2CD7',
    purple_hover_2: '#C5A6FF',
    purple_active: '#3B20B4',
    bright_purple: '#907CFF',
    purple_gray: '#DFDFEC',

    header: '#1d1531',

    badge_blue: '#002F6A',
    badge_green: '#016131',

    mybg: 'black', // dark blue
    bg_2: '#111113',
    bg_3: '#090910',

    mycard: '#19191b',
    mycard_light: '#212121',
    mycard_light_2x: '#303136',
    mycard_dark: '#121212',

    grey_text: '#B6B6B6',
    text_primary: 'white',
    text_secondary: '#b2b3bd',
    text_secondary_2: '#D3D3D3',

    yellow: '#EFDB72',
    yellow_2: '#FFA500',

    red: '#e18787',
    red_2: '#FF5F5F',

    // green colors
    light_green: '#3EE5C2',
    light_green_2: '#61FCAE',
    light_green_30p: '#3EE5C24D',

    border_light: '#CFCFEA',
    border_light_3p: '#CFCFEA0D',
    border_light_30p: '#CFCFEA4D',

    disabled_button: '#2A2A3D80',
    disabled_button_text: '#7D7D93',

    dark_bg: '#111119',
    purple_tint: '#CFCFEA',
    lavender_gray: '#B4B1BD',
  },
  fontSizes: {
    large: '50px',
  },
  space: {
    large: '50px',
  },
  sizes: {
    prose: '100%',
  },
  components: {
    MenuItem: {
      bg: 'highlight',
    },
    Badge: {
      baseStyle: {
        lineHeight: 'initial',
        borderRadius: '4px',
      },
    },
  },
  fonts: {
    heading: inter.style.fontFamily,
    body: inter.style.fontFamily,
  },
});

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const CONNECTOR_NAMES = ['Braavos', 'Argent X', 'Argent (mobile)']; // 'Argent Web Wallet'];

export default function Template({ children }: { children: React.ReactNode }) {
  const chains = [mainnet];
  const provider = jsonRpcProvider({
    rpc: (chain) => {
      const args: RpcProviderOptions = {
        nodeUrl:
          'https://rpc.nethermind.io/mainnet-juno?apikey=t1HPjhplOyEQpxqVMhpwLGuwmOlbXN0XivWUiPAxIBs0kHVK',
        chainId: constants.StarknetChainId.SN_MAIN,
      };
      return args;
    },
  });
  const pathname = usePathname();

  function getIconNode(icon: typeof import('*.svg'), alt: string) {
    return (
      <Center className="my-menu-button" width="100%" marginLeft={'-20px'}>
        <Image src={icon} alt={alt} />
      </Center>
    );
  }

  return (
    <JotaiProvider store={MY_STORE}>
      <StarknetConfig
        chains={chains}
        provider={provider}
        connectors={getConnectors(isMobile)}
      >
        <ChakraBaseProvider theme={theme}>
          <Flex minHeight={'100vh'} bgColor={'mybg'}>
            <React.Suspense>
              <Container width={'100%'} padding="0px">
                <Navbar
                  hideTg={pathname.includes('slinks')}
                  forceShowConnect={pathname.includes('slinks')}
                />
                {children}
                <Toaster />
              </Container>
            </React.Suspense>
          </Flex>
        </ChakraBaseProvider>
      </StarknetConfig>
    </JotaiProvider>
  );
}
