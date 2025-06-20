import { ChevronDownIcon, HamburgerIcon, EmailIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
import {
  connect,
  ConnectOptionsWithConnectors,
  StarknetkitConnector,
} from 'starknetkit';

import tg from '@/assets/tg.svg';
import argentMobile from '@/assets/argentMobile.svg';
import CONSTANTS from '@/constants';
import { getERC20Balance } from '@/store/balance.atoms';
import { addressAtom } from '@/store/claims.atoms';
import { lastWalletAtom } from '@/store/utils.atoms';
import {
  getEndpoint,
  getTokenInfoFromName,
  MyMenuItemProps,
  MyMenuListProps,
  shortAddress,
  standariseAddress,
  truncate,
} from '@/utils';
import {
  InjectedConnector,
  useAccount,
  useConnect,
  useDisconnect,
  useStarkProfile,
} from '@starknet-react/core';
import mixpanel from 'mixpanel-browser';
import { useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { constants } from 'starknet';
import {
  ArgentMobileConnector,
  isInArgentMobileAppBrowser,
} from 'starknetkit/argentMobile';
import {
  BraavosMobileConnector,
  isInBraavosMobileAppBrowser,
} from 'starknetkit/braavosMobile';
import { WebWalletConnector } from 'starknetkit/webwallet';
import TncModal from './TncModal';

export function getConnectors(isMobile: boolean) {
  const mobileConnector = ArgentMobileConnector.init({
    options: {
      dappName: 'STRKFarm',
      url: getEndpoint(),
      chainId: constants.NetworkName.SN_MAIN,
    },
    inAppBrowserOptions: {},
  }) as StarknetkitConnector;

  const mobileBraavosConnector = BraavosMobileConnector.init({
    inAppBrowserOptions: {},
  }) as StarknetkitConnector;

  const argentXConnector = new InjectedConnector({
    options: {
      id: 'argentX',
      name: 'Argent X',
    },
  });

  const braavosConnector = new InjectedConnector({
    options: {
      id: 'braavos',
      name: 'Braavos',
    },
  });

  const keplrConnector = new InjectedConnector({
    options: {
      id: 'keplr',
      name: 'Keplr',
    },
  });

  const isInstalled = [argentXConnector, braavosConnector, keplrConnector].map(
    (wallet) => {
      return {
        id: wallet.id,
        isInstalled:
          typeof window === 'undefined'
            ? false
            : window[`starknet_${wallet.id}`] !== undefined,
      };
    },
  );

  const webWalletConnector = new WebWalletConnector({
    url: 'https://web.argent.xyz',
  }) as StarknetkitConnector;

  if (isInArgentMobileAppBrowser()) {
    return [mobileConnector];
  } else if (isInBraavosMobileAppBrowser()) {
    return [mobileBraavosConnector];
  } else if (isMobile) {
    return [
      braavosConnector,
      mobileConnector,
      mobileBraavosConnector,
      webWalletConnector,
    ];
  }

  const defaultConnectors = [
    argentXConnector,
    braavosConnector,
    keplrConnector,
  ];

  // put uninstall wallets at the end
  const sortedConnectors: any[] = defaultConnectors.sort((a, b) => {
    const aInstalled = isInstalled.find(
      (wallet) => wallet.id === a.id,
    )?.isInstalled;
    const bInstalled = isInstalled.find(
      (wallet) => wallet.id === b.id,
    )?.isInstalled;

    if (aInstalled && bInstalled) {
      return 0;
    } else if (aInstalled) {
      return -1;
    }
    return 1;
  });

  sortedConnectors.push(mobileConnector);
  sortedConnectors.push(webWalletConnector);
  return sortedConnectors;
}

const walletIconMap: Record<string, any> = {
  argentMobile,
  argentWebWallet: EmailIcon,
};

const getWalletIcon = (walletId: string) => {
  console.log(walletId, 'walletId');
  return walletIconMap[walletId];
};

interface NavbarProps {
  hideTg?: boolean;
  forceShowConnect?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const { address, connector, account } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const setAddress = useSetAtom(addressAtom);
  const { data: starkProfile } = useStarkProfile({
    address,
    useDefaultPfp: true,
  });
  const { connect: connectSnReact } = useConnect();

  const [lastWallet, setLastWallet] = useAtom(lastWalletAtom);

  const getTokenBalance = async (token: string, address: string) => {
    const tokenInfo = getTokenInfoFromName(token);
    const balance = await getERC20Balance(tokenInfo, address);

    return balance.amount.toEtherToFixedDecimals(6);
  };

  console.log(account, 'account');

  const connectorConfig: ConnectOptionsWithConnectors = useMemo(() => {
    return {
      modalMode: 'alwaysAsk',
      modalTheme: 'dark',
      webWalletUrl: 'https://web.argent.xyz',
      argentMobileOptions: {
        dappName: 'STRKFarm',
        chainId: constants.NetworkName.SN_MAIN,
        url: getEndpoint(),
      },
      dappName: 'STRKFarm',
      connectors: getConnectors(isMobile) as StarknetkitConnector[],
    };
  }, [isMobile]);

  async function connectWallet(config = connectorConfig) {
    try {
      const { connector } = await connect(config);
      console.log(connector, 'connector');

      if (connector) {
        connectSnReact({ connector: connector as any });
      }
    } catch (error) {
      console.error('connectWallet error', error);
    }
  }

  useEffect(() => {
    const config = connectorConfig;
    connectWallet({
      ...config,
      modalMode: 'neverAsk',
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (address) {
        const standardAddr = standariseAddress(address);
        const userProps = {
          address: standardAddr,
          ethAmount: await getTokenBalance('ETH', address),
          usdcAmount: await getTokenBalance('USDC', address),
          strkAmount: await getTokenBalance('STRK', address),
        };
        mixpanel.track('wallet connect trigger', userProps);
        mixpanel.identify(standariseAddress(standardAddr));
        mixpanel.people.set(userProps);
      }
    })();
  }, [address]);

  // Set last wallet when a new wallet is connected
  useEffect(() => {
    console.log('lastWallet connector', connector?.name);
    if (connector) {
      const name: string = connector.name;
      setLastWallet(name);
    }
  }, [connector]);

  // set address atom
  useEffect(() => {
    console.log('tncinfo address', address);
    setAddress(address);
  }, [address]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container
      width={'100%'}
      padding={0}
      position={'sticky'}
      bg="mybg"
      zIndex={999}
      top="0"
    >
      <TncModal />
      {/* <Center bg="bg" color="gray" padding={0}>
        <Text
          fontSize="12px"
          textAlign={'center'}
          padding="6px 5px"
          color="#a5a5d9"
        >
          <b>
            Strategies with{' '}
            <Link
              href="https://x.com/strkfarm/status/1889933140657053786"
              target="_blank"
              textDecoration={'underline'}
            >
              {' '}
              zkLend exploit
            </Link>{' '}
            exposure have been retired. You can check your partially recovered
            funds
            <Link href="/recovery" color="orange">
              {' '}
              here.
            </Link>
          </b>
        </Text>
      </Center> */}
      <Box
        width={'100%'}
        maxWidth="1400px"
        margin={'0px auto'}
        padding={'20px 20px 10px'}
      >
        <Flex width={'100%'}>
          <Link href="/" margin="auto auto auto 0" textAlign={'left'}>
            {/* <Image
              src={fulllogo.src}
              alt="logo"
              height={{ base: '35px', md: '50px' }}
            /> */}
            <Text fontSize={'30px'} color={'purple'} fontWeight={'bold'}>
              Troves
            </Text>
          </Link>
          {/* <Link href={'/claims'} isExternal>
            <Button
              margin="0 0 0 auto"
              borderColor="color2"
              color="color2"
              variant="ghost"
              marginRight={'30px'}
              leftIcon={
                <Avatar
                  size="sm"
                  bg="highlight"
                  color="color2"
                  name="T G"
                  src={CONSTANTS.LOGOS.STRK}
                />
              }
              _hover={{
                bg: 'color2_50p',
              }}
              display={{ base: 'none !important', md: 'flex !important' }}
            >
              Claims
            </Button>
          </Link> */}

          <Link href="/" margin="0 10px 0 0">
            <Button
              bg="transparent"
              color="text_secondary"
              variant="outline"
              border="none"
              px="10px"
              _hover={{
                color: 'text_primary',
              }}
              display={{ base: 'none !important', lg: 'flex !important' }}
              onClick={() => {
                mixpanel.track('home_clicked');
              }}
            >
              Home
            </Button>
          </Link>
          {/* <Link href="/raffle" margin="0 10px 0 0">
            <Button
              bg="transparent"
              color="color2"
              variant="outline"
              border="none"
              px="10px"
              _hover={{
                bg: 'color2_50p',
              }}
              display={{ base: 'none !important', lg: 'flex !important' }}
              onClick={() => {
                mixpanel.track('home_clicked');
              }}
            >
              🕹 {'  '}Raffle
            </Button>
          </Link> */}
          <Link href="/community" margin="0 10px 0 0">
            <Button
              bg="transparent"
              color="text_secondary"
              variant="outline"
              border="none"
              _hover={{
                color: 'text_primary',
              }}
              px="10px"
              display={{ base: 'none !important', lg: 'flex !important' }}
              onClick={() => {
                mixpanel.track('community_program_click');
              }}
            >
              ✨ Community Program
            </Button>
          </Link>

          {!props.hideTg && (
            <Link
              href={CONSTANTS.COMMUNITY_TG}
              textDecoration="none !important"
              isExternal
            >
              <IconButton
                aria-label="tg"
                variant={'ghost'}
                borderColor={'color2'}
                display={{ base: 'block', md: 'none' }}
                icon={
                  <Avatar
                    size="sm"
                    bg="highlight"
                    className="glow-button"
                    name="T G"
                    color="color2"
                    src={tg.src}
                    _hover={{
                      bg: 'color2_50p',
                    }}
                  />
                }
              />
              <Button
                margin="0 0 0 auto"
                borderColor="purple"
                color="purple"
                variant="outline"
                leftIcon={
                  <Avatar
                    size="xs"
                    bg="highlight"
                    color="color2"
                    name="T G"
                    src={tg.src}
                  />
                }
                _hover={{
                  bg: 'purple_hover_2',
                  color: 'black',
                }}
                display={{ base: 'none !important', md: 'flex !important' }}
              >
                Telegram
              </Button>
            </Link>
          )}

          {true && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={address ? <ChevronDownIcon /> : <></>}
                iconSpacing={{ base: '1px', sm: '5px' }}
                bgColor={'purple'}
                color={'black'}
                borderRadius={'100px'}
                marginLeft={'10px'}
                display={{ base: 'flex' }}
                height={{ base: '2rem', sm: '2.5rem' }}
                my={{ base: 'auto', sm: 'initial' }}
                paddingX={{ base: '0.5rem', sm: '1rem' }}
                fontSize={{ base: '0.5rem', sm: '0.8rem' }}
                fontWeight={'bold'}
                size="xs"
                _hover={{
                  bgColor: 'purple_hover',
                }}
                _active={{
                  bgColor: 'purple_active',
                }}
                onClick={
                  address
                    ? undefined
                    : () => {
                        connectWallet();
                      }
                }
              >
                <Center>
                  {address ? (
                    <Center display="flex" alignItems="center" gap=".5rem">
                      <Image
                        // src={getWalletIcon(connector?.id ?? '').src}
                        src={
                          starkProfile?.profilePicture ||
                          connector?.id === 'argentMobile'
                            ? getWalletIcon(connector?.id ?? '').src
                            : (connector?.icon.toString() ??
                              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa5dG19ABS0ge6iFAgpsvE_ULDUa4fJyT7hg&s')
                        }
                        alt="pfp"
                        width={{ base: '20px', sm: '22px' }}
                        height={{ base: '20px', sm: '22px' }}
                        rounded="full"
                        background={'mybg'}
                        padding={'3px'}
                      />{' '}
                      <Text as="h3" marginTop={'3px !important'}>
                        {starkProfile && starkProfile.name
                          ? truncate(starkProfile.name, 6, isMobile ? 0 : 6)
                          : shortAddress(address, 4, isMobile ? 0 : 4)}
                      </Text>
                    </Center>
                  ) : (
                    'Connect wallet'
                  )}
                </Center>
              </MenuButton>
              <MenuList {...MyMenuListProps}>
                {address && (
                  <MenuItem
                    {...MyMenuItemProps}
                    onClick={() => {
                      disconnectAsync().then((data) => {
                        console.log('wallet disconnected');
                        setLastWallet(null);
                      });
                    }}
                  >
                    Disconnect
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}

          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon color="color2" height="30px" width="30px" />}
              background="transparent"
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              _focus={{
                bg: 'none',
              }}
            />
          )}

          <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent background="bg">
              <DrawerHeader color="text_secondary">Menu</DrawerHeader>
              <DrawerBody>
                <Flex direction="column">
                  <Link href="/" color="text_secondary" onClick={onClose}>
                    Home
                  </Link>
                  {/* <Link href="/raffle" color="text_secondary" onClick={onClose}>
                    🕹 {'  '}Raffle
                  </Link> */}
                  <Link
                    href="/community"
                    color="text_secondary"
                    onClick={() => {
                      onClose();
                      mixpanel.track('community_program_click');
                    }}
                    mt={4}
                  >
                    ✨ Community Program
                  </Link>
                </Flex>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
    </Container>
  );
}
