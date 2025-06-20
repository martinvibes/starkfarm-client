import React, { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Avatar,
  Box,
  Grid,
  Tag,
  TagLabel,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  ALL_FILTER,
  filterAtoms,
  filters,
  updateFiltersAtom,
} from '@/store/protocols';
import { Category, PoolType } from '@/store/pools';
import mixpanel from 'mixpanel-browser';

function getTextProps(isActive: boolean) {
  return {
    fontSize: '14px',
    fontWeight: isActive ? '600' : 'normal',
    color: isActive ? 'black' : 'white',
  };
}

function MyTag(
  props: {
    index: number;
    totalItems: number;
    isSelected: boolean;
    onClick: () => void;
    label: string;
  } & React.ComponentProps<typeof Tag>,
) {
  const { index, totalItems, isSelected, onClick, label, ...tagProps } = props;

  const borderRadius = useMemo(() => {
    if (index === 0) {
      return '8px 0px 0px 8px';
    } else if (index === totalItems - 1) {
      return '0px 8px 8px 0px';
    }
    return 'none';
  }, [index, totalItems]);

  return (
    <Tag
      size="md"
      padding={'12px'}
      as={'button'}
      bg={isSelected ? 'purple' : 'mycard_light'}
      color={'white'}
      borderRadius={borderRadius}
      display={'flex'}
      justifyContent={'center'}
      _hover={{
        bg: isSelected ? 'purple_hover_2' : 'mycard_light_2x',
        '& > *': {
          fontWeight: '600',
        },
      }}
      onClick={() => {
        onClick();
      }}
    >
      <TagLabel {...getTextProps(isSelected)}>{label}</TagLabel>
    </Tag>
  );
}

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
      gap={{ base: '20px' }}
      flexDirection={{ base: 'column' }}
      justifyContent={'space-between'}
    >
      <Grid
        display={{ base: 'none', md: 'grid' }}
        templateColumns={{
          base: 'repeat(auto-fit, minmax(40px, 1fr))',
          md: `repeat(${filters.protocols.length}, 52px)`,
        }}
        gap={0.5}
        width={{ base: '100%', md: 'auto' }}
      >
        {filters.protocols
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p, index) => {
            const isSelected =
              isProtocolSelected(p.name) &&
              !protocolsFilter.includes(ALL_FILTER);
            return (
              <Tag
                key={p.name}
                as="button"
                alignItems={'center'}
                justifyContent={'center'}
                size={{ base: 'md', md: 'lg' }}
                padding={{ base: '3px', md: '5px' }}
                bg={isSelected ? 'purple' : 'mycard_light'}
                borderRadius={
                  index === 0
                    ? '8px 0 0 8px'
                    : index === filters.protocols.length - 1
                      ? '0 8px 8px 0'
                      : 'none'
                }
                _hover={{
                  bg: isSelected ? 'purple_hover_2' : 'mycard_light_2x',
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
            );
          })}
      </Grid>

      {/* Clear all or select all button */}
      <Tag
        display={'flex'}
        gap={'10px'}
        size="lg"
        borderRadius="md"
        padding={'12px'}
        fontSize={'14px'}
        fontWeight={'normal'}
        bg={'mycard_light'}
        color={'white'}
        marginRight={'5px'}
        as="button"
        marginTop={'1px'}
        aria-label={atleastOneProtocolSelected() ? 'Clear all' : 'Select all'}
        _hover={{
          bg: 'mycard_light_2x',
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
          color={'text_primary'}
          padding={'4px 6px'}
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

  return (
    <Box width={'100%'} display={'flex'} justifyContent={'space-between'}>
      <Box width={'100%'} display={'flex'} gap={'28px'}>
        <Grid templateColumns={'repeat(4, 1fr)'} gap={0.5}>
          {/* Stable pools */}
          <MyTag
            index={0}
            totalItems={4}
            isSelected={categoriesFilter.includes(Category.Stable.valueOf())}
            onClick={() => updateCategory(Category.Stable)}
            label={Category.Stable.valueOf().split(' ')[0]}
          />
          {/* STRK pools */}
          <MyTag
            index={1}
            totalItems={4}
            isSelected={categoriesFilter.includes(Category.STRK.valueOf())}
            onClick={() => updateCategory(Category.STRK)}
            label={Category.STRK.valueOf().split(' ')[0]}
          />

          {/* ETH pools */}
          <MyTag
            index={2}
            totalItems={4}
            isSelected={categoriesFilter.includes(Category.ETH.valueOf())}
            onClick={() => updateCategory(Category.ETH)}
            label={Category.ETH.valueOf().split(' ')[0]}
          />

          {/* Low risk pools */}
          <MyTag
            index={3}
            totalItems={4}
            isSelected={isLowRisk()}
            onClick={() => updateRiskLevel(['1', '2'])}
            label="Low risk"
          />
        </Grid>

        <Grid templateColumns={'repeat(3, 1fr)'} gap={0.5}>
          {/* DEXes */}
          <MyTag
            index={0}
            totalItems={3}
            isSelected={
              poolTypeFilters.includes(PoolType.DEXV2.valueOf()) ||
              poolTypeFilters.includes(PoolType.DEXV3.valueOf())
            }
            onClick={() =>
              updatePoolType([PoolType.DEXV2, PoolType.DEXV3], 'DEX')
            }
            label="DEX"
          />
          {/* Lending */}
          <MyTag
            index={1}
            totalItems={3}
            isSelected={poolTypeFilters.includes(PoolType.Lending.valueOf())}
            onClick={() => updatePoolType([PoolType.Lending], 'Lending')}
            label="Lending"
          />
          {/* Derivatives */}
          <MyTag
            index={2}
            totalItems={3}
            isSelected={poolTypeFilters.includes(
              PoolType.Derivatives.valueOf(),
            )}
            onClick={() =>
              updatePoolType([PoolType.Derivatives], 'Derivatives')
            }
            label="Derivatives"
          />
        </Grid>
      </Box>
    </Box>
  );
}
