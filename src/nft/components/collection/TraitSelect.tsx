import clsx from 'clsx'
import useDebounce from 'hooks/useDebounce'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { ChevronUpIcon } from 'nft/components/icons'
import { Checkbox } from 'nft/components/layout/Checkbox'
import { subheadSmall } from 'nft/css/common.css'
import { Trait, useCollectionFilters } from 'nft/hooks/useCollectionFilters'
import { pluralize } from 'nft/utils/roundAndPluralize'
import { scrollToTop } from 'nft/utils/scrollToTop'
import { FormEvent, MouseEvent, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { Input } from '../layout/Input'
import * as styles from './Filters.css'

const TraitItem = ({
  trait,
  addTrait,
  removeTrait,
  isTraitSelected,
}: {
  trait: Trait
  addTrait: (trait: Trait) => void
  removeTrait: (trait: Trait) => void
  isTraitSelected: boolean
}) => {
  const [isCheckboxSelected, setCheckboxSelected] = useState(false)
  const [hovered, setHovered] = useState(false)
  const handleHover = () => setHovered(!hovered)
  const toggleShowFullTraitName = useCollectionFilters((state) => state.toggleShowFullTraitName)

  const { shouldShow, trait_value, trait_type } = useCollectionFilters((state) => state.showFullTraitName)
  const isEllipsisActive = (e: MouseEvent<HTMLElement>) => {
    if (e.currentTarget.offsetWidth < e.currentTarget.scrollWidth) {
      toggleShowFullTraitName({
        shouldShow: true,
        trait_value: trait.trait_value,
        trait_type: trait.trait_type,
      })
    }
  }
  useEffect(() => {
    setCheckboxSelected(isTraitSelected)
  }, [isTraitSelected])

  const handleCheckbox = (e: FormEvent) => {
    e.preventDefault()
    scrollToTop()

    if (!isCheckboxSelected) {
      addTrait(trait)
      setCheckboxSelected(true)
    } else {
      removeTrait(trait)
      setCheckboxSelected(false)
    }
  }

  const showFullTraitName = shouldShow && trait_type === trait.trait_type && trait_value === trait.trait_value

  return (
    <Row
      key={trait.trait_value}
      maxWidth="full"
      overflowX={'hidden'}
      overflowY={'hidden'}
      fontWeight="normal"
      className={`${subheadSmall} ${styles.subRowHover}`}
      justifyContent="space-between"
      cursor="pointer"
      paddingLeft="12"
      paddingRight="12"
      style={{ paddingBottom: '21px', paddingTop: '21px', maxHeight: '44px' }}
      onMouseEnter={handleHover}
      onMouseLeave={handleHover}
      onClick={handleCheckbox}
    >
      <Box
        as="span"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        overflow="hidden"
        maxWidth={!showFullTraitName ? '160' : 'full'}
        onMouseOver={(e) => isEllipsisActive(e)}
        onMouseLeave={() => toggleShowFullTraitName({ shouldShow: false, trait_type: '', trait_value: '' })}
      >
        {trait.trait_type === 'Number of traits'
          ? `${trait.trait_value} trait${pluralize(Number(trait.trait_value))}`
          : trait.trait_value}
      </Box>
      <Checkbox checked={isCheckboxSelected} hovered={hovered} onChange={handleCheckbox}>
        <Box as="span" color="textSecondary" minWidth={'8'} paddingTop={'2'} paddingRight={'12'} position={'relative'}>
          {!showFullTraitName && trait.trait_count}
        </Box>
      </Checkbox>
    </Row>
  )
}

export const TraitSelect = ({ traits, type }: { traits: Trait[]; type: string }) => {
  const addTrait = useCollectionFilters((state) => state.addTrait)
  const removeTrait = useCollectionFilters((state) => state.removeTrait)
  const selectedTraits = useCollectionFilters((state) => state.traits)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [isOpen, setOpen] = useState(false)

  const { searchedTraits } = useMemo(() => {
    const isTypeIncluded = type.includes(debouncedSearch)
    const searchedTraits = traits.filter(
      (t) => isTypeIncluded || t.trait_value.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    return { searchedTraits }
  }, [debouncedSearch, traits, type])

  return traits.length ? (
    <Box
      as="details"
      className={clsx(subheadSmall, !isOpen && styles.rowHover, isOpen && styles.detailsOpen)}
      style={{ borderTop: '1px solid #99A1BD3D' }}
      open={isOpen}
    >
      <Box
        as="summary"
        className={clsx(isOpen && styles.summaryOpen, isOpen ? styles.rowHoverOpen : styles.rowHover)}
        display="flex"
        paddingTop="8"
        paddingRight="12"
        paddingBottom="8"
        paddingLeft="12"
        justifyContent="space-between"
        cursor="pointer"
        alignItems="center"
        onClick={(e) => {
          e.preventDefault()
          setOpen(!isOpen)
        }}
      >
        {type}
        <Box display="flex" alignItems="center">
          <Box color="textSecondary" display="inline-block" marginRight="12">
            {searchedTraits.length}
          </Box>
          {/* <Input
              display={!traits?.length ? 'none' : undefined}
              value={search}
              onChange={(e: FormEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
              width="full"
              marginBottom="8"
              placeholder="Search traits"
              autoComplete="off"
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ border: '2px solid rgba(153, 161, 189, 0.24)', maxWidth: '300px' }}
            /> */}

          <Box
            color="textSecondary"
            display="inline-block"
            transition="250"
            height="28"
            width="28"
            style={{
              transform: `rotate(${isOpen ? 0 : 180}deg)`,
            }}
          >
            <ChevronUpIcon />
          </Box>
        </Box>
      </Box>
      <Column className={styles.filterDropDowns} paddingLeft="0">
        <Input
          value={search}
          onChange={(e: FormEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
          placeholder="Search"
          marginTop="8"
          marginBottom="8"
        />
        {searchedTraits.map((trait) => {
          const isTraitSelected = selectedTraits.find(
            ({ trait_type, trait_value }) =>
              trait_type === trait.trait_type && String(trait_value) === String(trait.trait_value)
          )

          return (
            <TraitItem
              isTraitSelected={!!isTraitSelected}
              key={trait.trait_value}
              {...{ trait, addTrait, removeTrait }}
            />
          )
        })}
      </Column>
    </Box>
  ) : null
}
