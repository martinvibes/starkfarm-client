import React from 'react';
import {
  Box,
  Flex,
  Text,
  Link,
  Image,
  IconButton,
  useDisclosure,
  Container,
  Grid,
} from '@chakra-ui/react';
import TncModal from './TncModal';
import tg from '@/assets/tg.svg';
import x from '@/assets/x.svg';
import fulllogo from '@public/fulllogo.png';
import discord from '@public/discord.svg';

const footerLinks = [
  {
    heading: 'Developers',
    links: [
      { label: 'Defi Spring', href: 'https://defispring.starknet.io/' },
      {
        label: 'Open-source',
        href: 'https://app.onlydust.com/p/strkfarm',
        isExternal: true,
      },
      { label: 'Audit', href: 'https://www.strkfarm.com/audit' },
    ],
  },
  {
    heading: 'General',
    links: [
      {
        label: 'Branding kit',
        href: 'https://drive.google.com/drive/folders/1-D6uizWgdH2XwbP0f3Fc22wQgxhr_RUY?usp=sharing',
      },
      { label: 'Status page', href: 'https://status.starkfarm.com/' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Telegram', href: 'https://t.me/starkfarm', isExternal: true },
      {
        label: 'Twitter',
        href: 'https://twitter.com/starkfarm',
        isExternal: true,
      },
      {
        label: 'Github',
        href: 'https://github.com/starkfarm',
        isExternal: true,
      },
    ],
  },
];

const socialLinks = [
  {
    icon: discord.src,
    label: 'Discord',
    href: 'https://discord.gg/',
    gradient: 'linear-gradient(135deg, #6F4FF2 0%, #61FCAE 100%)',
  },
  {
    icon: tg.src,
    label: 'Telegram',
    href: 'https://t.me/starkfarm',
    gradient: 'linear-gradient(135deg, #6F4FF2 0%, #61FCAE 100%)',
  },
  {
    icon: x.src,
    label: 'Twitter',
    href: 'https://twitter.com/starkfarm',
    gradient: 'linear-gradient(135deg, #6F4FF2 0%, #61FCAE 100%)',
  },
];

const Footer: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container width={'100%'} bg="dark_bg">
      <Box
        width={'100%'}
        maxWidth="1152px"
        margin={'0px auto'}
        padding={{ base: '20px 10px 10px' }}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          gap="10px"
          paddingBottom="40px"
        >
          <Flex
            direction="column"
            align={{ base: 'center', md: 'flex-start' }}
            minW="220px"
          >
            <Image
              src={fulllogo.src}
              alt="logo"
              height={{ base: '35px', md: '50px' }}
            />
          </Flex>

          <Grid
            gridTemplateColumns={{
              base: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            justifyContent={{ base: 'center', md: 'flex-end' }}
            justifyItems={{ base: 'center', md: 'start' }}
            textAlign={{ base: 'center', md: 'left' }}
            gap={{ base: '16px', md: '32px' }}
          >
            {footerLinks.map((col) => (
              <Box key={col.heading} minW="120px">
                <Text fontWeight="bold" mb={3} color="white">
                  {col.heading}
                </Text>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    isExternal={link.isExternal}
                    color="text_subtle"
                    display="block"
                    marginBottom="2px"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            ))}
          </Grid>
        </Flex>

        <TncModal />
      </Box>

      <Box borderTopWidth="1px" borderTopColor="text_subtle"></Box>

      <Box
        width={'100%'}
        maxWidth="1152px"
        margin={'0px auto'}
        // padding={{ base: ' 10px 10px' }}
      >
        <Flex
          paddingTop="24px"
          paddingBottom="24px"
          align="center"
          justify="space-between"
          direction={{ base: 'column', md: 'row' }}
          gap="4px"
        >
          <Text fontSize="sm" color="text_subtle">
            © 2024 STRKFarm. All right reserved.
          </Text>
          <Flex align="center" gap={6}>
            <Text
              as="button"
              color="text_subtle"
              fontSize="sm"
              _hover={{ color: 'text_subtle', textDecoration: 'underline' }}
              onClick={onOpen}
              mr={2}
            >
              Terms and Conditions
            </Text>
            <Flex gap={2}>
              {socialLinks.map((s) => (
                <IconButton
                  as="a"
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  icon={<Image src={s.icon} alt={s.label} />}
                  target="_blank"
                  rel="noopener noreferrer"
                  bgGradient={s.gradient}
                  borderRadius="full"
                  boxSize="40px"
                  minW="40px"
                  minH="40px"
                  p={2}
                  _hover={{ filter: 'brightness(1.2)' }}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default Footer;
