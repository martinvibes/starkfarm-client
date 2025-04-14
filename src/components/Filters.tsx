import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Avatar,
  Box,
  Grid,
  HStack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import {
  ALL_FILTER,
  filterAtoms,
  filters,
  updateFiltersAtom,
} from '@/store/protocols';
import { Category, PoolType } from '@/store/pools';
import mixpanel from 'mixpanel-browser';

export function ProtocolFilters() {
  const protocolsFilter = useAtomValue(filterAtoms.protocolsAtom);

  function isProtocolSelected(protocolName: string) {
    return (
      protocolsFilter.includes(ALL_FILTER) ||
      protocolsFilter.includes(protocolName)
    );
  }

  function atleastOneProtocolSelected() {
    return (
      protocolsFilter.includes(ALL_FILTER) ||
      (protocolsFilter.length > 0 && !protocolsFilter.includes(ALL_FILTER))
    );
  }

  function getSelectedProtocolsCount() {
    if (protocolsFilter.includes(ALL_FILTER)) {
      return filters.protocols.length;
    }
    return protocolsFilter.length;
  }

  const updateFilters = useSetAtom(updateFiltersAtom);

  return (
    <Box
      width={'100%'}
      display={'flex'}
      flexDirection={{ base: 'column', md: 'row' }}
      justifyContent={'space-between'}
    >
      <Grid
        templateColumns={{
          base: 'repeat(auto-fit, minmax(40px, 1fr))',
          md: `repeat(${filters.protocols.length}, 52px)`,
        }}
        gap={0}
        width={{ base: '100%', md: 'auto' }}
      >
        {filters.protocols.map((p, index) => (
          <Tag
            key={p.name}
            as="button"
            alignItems={'center'}
            justifyContent={'center'}
            size={{ base: 'md', md: 'lg' }}
            padding={{ base: '3px', md: '5px' }}
            bg={
              isProtocolSelected(p.name) &&
              !protocolsFilter.includes(ALL_FILTER)
                ? 'purple'
                : 'transparent'
            }
            borderLeftWidth={index === 0 ? '1px' : '0px'}
            borderRightWidth={'1px'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderTopLeftRadius={index === 0 ? '8px' : 'none'}
            borderTopRightRadius={
              index === filters.protocols.length - 1 ? '8px' : 'none'
            }
            borderBottomLeftRadius={index === 0 ? '8px' : 'none'}
            borderBottomRightRadius={
              index === filters.protocols.length - 1 ? '8px' : 'none'
            }
            borderColor={'slate_blue'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
            onClick={() => {
              const selectedProtocols = protocolsFilter.includes(ALL_FILTER)
                ? []
                : protocolsFilter;

              let updatedProtocols = [];
              if (selectedProtocols.includes(p.name)) {
                updatedProtocols = selectedProtocols.filter(
                  (x) => x !== p.name,
                );
              } else {
                updatedProtocols = [...selectedProtocols, p.name];
              }
              if (updatedProtocols.length === filters.protocols.length) {
                updatedProtocols = [ALL_FILTER];
              }
              mixpanel.track('Protocol Filter', {
                protocol: p.name,
                selected:
                  updatedProtocols.includes(p.name) ||
                  updatedProtocols.includes(ALL_FILTER),
                updatedProtocols: JSON.stringify(updatedProtocols),
              });
              updateFilters('protocols', updatedProtocols);
            }}
          >
            <Tooltip label={p.name}>
              <Avatar
                src={`${p.logo}`}
                border={'1px solid var(--chakra-colors-bg)'}
                size="sm"
                name={p.name}
                filter={
                  isProtocolSelected(p.name)
                    ? 'none'
                    : 'grayscale(100%) sepia(20%) hue-rotate(210deg) brightness(1.2) invert(0.2)'
                }
              />
            </Tooltip>
          </Tag>
        ))}
      </Grid>

      {/* Clear all or select all button */}
      <Tag
        display={'flex'}
        gap={'10px'}
        size="lg"
        borderWidth={'1px'}
        borderRadius="md"
        borderColor={'slate_blue'}
        padding={'12px'}
        fontSize={'14px'}
        fontWeight={'normal'}
        bg={'transparent'}
        color={'white'}
        marginRight={'5px'}
        as="button"
        marginTop={'1px'}
        aria-label={atleastOneProtocolSelected() ? 'Clear all' : 'Select all'}
        _hover={{
          bg: 'purple_hover_2',
          '& > *': {
            color: 'black',
          },
        }}
        onClick={() => {
          updateFilters(
            'protocols',
            atleastOneProtocolSelected() ? [] : [ALL_FILTER],
          );
          mixpanel.track('Clear/Select all protocols', {
            atleastOneProtocolSelected: atleastOneProtocolSelected(),
          });
        }}
      >
        <Text
          bg={'purple'}
          color={'white'}
          padding={'4px'}
          borderRadius={'4px'}
          fontSize={'10px'}
        >
          {getSelectedProtocolsCount()}
        </Text>
        <Text>
          {atleastOneProtocolSelected() ? 'Clear filters' : 'Select all'}
        </Text>
      </Tag>
    </Box>
  );
}

export function CategoryFilters() {
  const updateFilters = useSetAtom(updateFiltersAtom);
  const protocolFilters = useAtomValue(filterAtoms.protocolsAtom);
  const categoriesFilter = useAtomValue(filterAtoms.categoriesAtom);
  const riskLevelFilters = useAtomValue(filterAtoms.riskAtom);
  const poolTypeFilters = useAtomValue(filterAtoms.typesAtom);

  function updateCategory(category: Category) {
    const existingCategories = categoriesFilter.includes(ALL_FILTER)
      ? []
      : categoriesFilter;
    let isCategoryAdded = false;
    console.log('filter34', 'categories', existingCategories);
    if (existingCategories.includes(category)) {
      const newFilters = existingCategories.filter(
        (x) => x !== category.valueOf(),
      );
      updateFilters(
        'categories',
        newFilters.length === 0 ? [ALL_FILTER] : newFilters,
      );
    } else {
      updateFilters('categories', [...existingCategories, category.valueOf()]);
      isCategoryAdded = true;
    }
    mixpanel.track('Category Filter', {
      category: category.valueOf(),
      selected: isCategoryAdded,
    });
  }

  function updateRiskLevel(riskLevels: string[], riskLevel = 'low') {
    let existingRiskLevels = riskLevelFilters.includes(ALL_FILTER)
      ? []
      : riskLevelFilters;

    let isSelected = false;
    console.log('filter34', 'riskLevels', existingRiskLevels);
    riskLevels.map((riskLevel) => {
      if (existingRiskLevels.includes(riskLevel)) {
        const newFilters = existingRiskLevels.filter((x) => x !== riskLevel);
        existingRiskLevels =
          newFilters.length === 0 ? [ALL_FILTER] : newFilters;
        updateFilters('risk', existingRiskLevels);
      } else {
        existingRiskLevels = [...existingRiskLevels, riskLevel];
        isSelected = true;
        updateFilters('risk', existingRiskLevels);
      }
    });

    mixpanel.track('Risk Filter', {
      riskLevel,
      selected: isSelected,
    });
  }

  function updatePoolType(types: PoolType[], name: string) {
    let existingPoolTypes = poolTypeFilters.includes(ALL_FILTER)
      ? []
      : poolTypeFilters;
    console.log('filter34', 'poolType', existingPoolTypes);
    let isSelected = false;
    types.map((type) => {
      if (existingPoolTypes.includes(type.valueOf())) {
        const newFilters = existingPoolTypes.filter(
          (x) => x !== type.valueOf(),
        );
        existingPoolTypes = newFilters.length === 0 ? [ALL_FILTER] : newFilters;
        updateFilters('poolTypes', existingPoolTypes);
      } else {
        existingPoolTypes = [...existingPoolTypes, type.valueOf()];
        isSelected = true;
        updateFilters('poolTypes', existingPoolTypes);
      }
    });
    mixpanel.track('Pool Type Filter', {
      poolType: name,
      selected: isSelected,
    });
  }

  function isLowRisk() {
    return riskLevelFilters.includes('1') || riskLevelFilters.includes('2');
  }

  function getTextProps(isActive: boolean) {
    return {
      fontSize: '14px',
      fontWeight: isActive ? '600' : 'normal',
      color: isActive ? 'black' : 'white',
      _hover: {
        color: 'black',
      },
    };
  }

  return (
    <Box width={'100%'} display={'flex'} justifyContent={'space-between'}>
      <Box width={'100%'} display={'flex'} gap={'28px'}>
        <Grid templateColumns={'repeat(4, 1fr)'} gap={0}>
          {/* Stable pools */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            bg={
              categoriesFilter.includes(Category.Stable.valueOf())
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            borderLeftWidth={'1px'}
            borderRightWidth={'1px'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderTopLeftRadius={'8px'}
            borderBottomLeftRadius={'8px'}
            borderTopRightRadius={'none'}
            borderBottomRightRadius={'none'}
            borderColor={'slate_blue'}
            display={'flex'}
            justifyContent={'center'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
            onClick={() => {
              updateCategory(Category.Stable);
            }}
          >
            <TagLabel
              {...getTextProps(
                categoriesFilter.includes(Category.Stable.valueOf()),
              )}
            >
              {Category.Stable.valueOf().split(' ')[0]}
            </TagLabel>
          </Tag>

          {/* STRK pools */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updateCategory(Category.STRK);
            }}
            bg={
              categoriesFilter.includes(Category.STRK.valueOf())
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderRightWidth={'1px'}
            borderRadius={'none'}
            borderColor={'slate_blue'}
            display={'flex'}
            justifyContent={'center'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel
              {...getTextProps(
                categoriesFilter.includes(Category.STRK.valueOf()),
              )}
            >
              {Category.STRK.valueOf().split(' ')[0]}
            </TagLabel>
          </Tag>

          {/* ETH pools */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updateCategory(Category.ETH);
            }}
            bg={
              categoriesFilter.includes(Category.ETH.valueOf())
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderRightWidth={'1px'}
            borderRadius={'none'}
            borderColor={'slate_blue'}
            display={'flex'}
            justifyContent={'center'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel
              {...getTextProps(
                categoriesFilter.includes(Category.ETH.valueOf()),
              )}
            >
              {Category.ETH.valueOf().split(' ')[0]}
            </TagLabel>
          </Tag>

          {/* Low risk pools */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updateRiskLevel(['1', '2']);
            }}
            bg={isLowRisk() ? 'purple' : 'transparent'}
            color={'white'}
            display={'flex'}
            justifyContent={'center'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderRightWidth={'1px'}
            borderTopLeftRadius={'none'}
            borderBottomLeftRadius={'none'}
            borderTopRightRadius={'8px'}
            borderBottomRightRadius={'8px'}
            borderColor={'slate_blue'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel {...getTextProps(isLowRisk())}>Low risk</TagLabel>
          </Tag>
        </Grid>

        <Grid templateColumns={'repeat(3, 1fr)'} gap={0}>
          {/* DEXes */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updatePoolType([PoolType.DEXV2, PoolType.DEXV3], 'DEX');
            }}
            bg={
              poolTypeFilters.includes(PoolType.DEXV2.valueOf()) ||
              poolTypeFilters.includes(PoolType.DEXV3.valueOf())
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            borderLeftWidth={'1px'}
            borderRightWidth={'1px'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderTopLeftRadius={'8px'}
            borderBottomLeftRadius={'8px'}
            borderTopRightRadius={'none'}
            borderBottomRightRadius={'none'}
            borderColor={'slate_blue'}
            display={'flex'}
            justifyContent={'center'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel
              {...getTextProps(
                poolTypeFilters.includes(PoolType.DEXV2.valueOf()) ||
                  poolTypeFilters.includes(PoolType.DEXV3.valueOf()),
              )}
            >
              DEX
            </TagLabel>
          </Tag>

          {/* Lending */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updatePoolType([PoolType.Lending], 'Lending');
            }}
            bg={
              poolTypeFilters.includes(PoolType.Lending)
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderRightWidth={'1px'}
            borderRadius={'none'}
            borderColor={'slate_blue'}
            display={'flex'}
            justifyContent={'center'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel
              {...getTextProps(poolTypeFilters.includes(PoolType.Lending))}
            >
              Lending
            </TagLabel>
          </Tag>

          {/* Derivatives */}
          <Tag
            size="md"
            padding={'12px'}
            as={'button'}
            onClick={() => {
              updatePoolType([PoolType.Derivatives], 'Derivatives');
            }}
            bg={
              poolTypeFilters.includes(PoolType.Derivatives)
                ? 'purple'
                : 'transparent'
            }
            color={'white'}
            display={'flex'}
            justifyContent={'center'}
            borderTopWidth={'1px'}
            borderBottomWidth={'1px'}
            borderRightWidth={'1px'}
            borderTopLeftRadius={'none'}
            borderBottomLeftRadius={'none'}
            borderTopRightRadius={'8px'}
            borderBottomRightRadius={'8px'}
            borderColor={'slate_blue'}
            _hover={{
              bg: 'purple_hover_2',
              '& > *': {
                color: 'black',
              },
            }}
          >
            <TagLabel
              {...getTextProps(poolTypeFilters.includes(PoolType.Derivatives))}
            >
              Derivative
            </TagLabel>
          </Tag>
        </Grid>

        {/* Reset */}
        <Tag
          size="md"
          bg="transparent"
          color={'white'}
          borderRadius="md"
          borderWidth={'1px'}
          borderColor={'slate_blue'}
          padding={'12px'}
          as={'button'}
          _hover={{
            bg: 'purple_hover_2',
            '& > *': {
              color: 'black',
            },
          }}
          onClick={() => {
            updateFilters('categories', [ALL_FILTER]);
            updateFilters('risk', [ALL_FILTER]);
            updateFilters('poolTypes', [ALL_FILTER]);
            mixpanel.track('Reset Filters');
          }}
        >
          <TagLabel {...getTextProps(false)}>
            <HStack>
              <Text>Reset</Text> <CloseIcon fontSize={'10px'} />
            </HStack>
          </TagLabel>
        </Tag>
      </Box>
    </Box>
  );
}
