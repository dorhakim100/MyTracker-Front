import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useLayoutEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { searchService } from '../../services/search/search-service'
import { searchTypes } from '../../assets/config/search-types'

import { RootState } from '../../store/store'
import { ItemFilter } from '../ItemFilter/ItemFilter'
import { showErrorMsg } from '../../services/event-bus.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { Item } from '../../types/item/Item'
import {
  loadItems,
  setItem,
  setSelectedMeal,
  setEditMealItem,
} from '../../store/actions/item.actions'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { useSlideDialogTitle } from '../SlideDialog/slide-dialog-title'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import {
  handleFavorite,
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { SearchFilter } from '../../types/searchFilter/SearchFilter'
import { Typography } from '@mui/material'
import debounce from 'lodash/debounce'

import { User } from '../../types/user/User'
import { SkeletonList } from '../SkeletonList/SkeletonList'
import { MealItem } from '../../types/mealItem/MealItem'
import { itemService } from '../../services/item/item.cache.service'
import { itemNameService } from '../../services/item/item-name.service'

import Lottie from 'lottie-react'
import searchLight from '../../../public/searching.json'
import searchDark from '../../../public/searching-dark.json'

import { imageService } from '../../services/image/image.service'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { CategoryHome } from './CategoryHome/CategoryHome'
import { CategoryBrowse } from './CategoryBrowse/CategoryBrowse'
import { RecentSearchChips } from './RecentSearchChips/RecentSearchChips'
import { EmptyState } from './EmptyState/EmptyState'
import { useCategoryCounts } from '../../hooks/useItemsByCategory'
import { recentSearchService } from '../../services/recent-search/recent-search.service'
import { itemService as itemHttpService } from '../../services/item/item.service'
import {
  BrowseView,
  isNutritionBrowseView,
  matchItemCategoryLabel,
} from '../../assets/config/item-categories'
import { itemSearchCategoriesNs } from './locals'
import { scrollSheetToTop } from './search-sheet-scroll'

interface ItemSearchProps {
  onAddToMealClick?: (item: MealItem) => void
}

type UiSearchSource = 'search' | 'meal'
export interface Filter {
  txt: string
  source: UiSearchSource
  sortBy: string
}

function getSearchItemKey(item: Item) {
  return item.searchId || item._id || ''
}

function mergeUniqueItems(primary: Item[], extra: Item[]) {
  const ids = new Set(primary.map(getSearchItemKey).filter(Boolean))
  const incoming = extra.filter((item) => {
    const key = getSearchItemKey(item)
    return key && !ids.has(key)
  })
  return [...primary, ...incoming]
}

function mergeSearchWithFavorites(favorites: Item[], searchHits: Item[]) {
  const favoriteKeys = new Set(favorites.map(getSearchItemKey).filter(Boolean))
  const searchByKey = new Map(
    searchHits.map((item) => [getSearchItemKey(item), item])
  )
  const favoritesFirst = favorites.map(
    (item) => searchByKey.get(getSearchItemKey(item)) || item
  )
  const rest = searchHits.filter(
    (item) => !favoriteKeys.has(getSearchItemKey(item))
  )
  return [...favoritesFirst, ...rest]
}

export function ItemSearch({ onAddToMealClick }: ItemSearchProps) {
  const { t, i18n } = useTranslation()
  const { t: tCategories } = useTranslation(itemSearchCategoriesNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const user = useSelector((state: RootState) => state.userModule.user)

  const favoriteItems = useSelector(
    (state: RootState) => state.itemModule.favoriteItems
  )

  const [results, setResults] = useState<Item[]>([])
  const [resultsDragable, setResultsDragable] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchRootRef = useRef<HTMLDivElement>(null)
  const isFirstFilterLayout = useRef(true)
  const searchRequestIdRef = useRef(0)
  const [browseView, setBrowseView] = useState<BrowseView | null>(null)
  const [isForward, setIsForward] = useState<boolean | null>(null)
  const [searchedTxt, setSearchedTxt] = useState('')
  const [recentQueries, setRecentQueries] = useState<string[]>([])
  const { data: categoryCounts } = useCategoryCounts(!browseView)

  const [filter, setFilter] = useState<Filter>({
    txt: '',
    source: searchTypes.search as UiSearchSource,
    sortBy: 'relevance',
  })

  const [isItemSelected, setIsItemSelected] = useState(false)
  const [isCustomLog, setIsCustomLog] = useState(false)

  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const sortedResults = useMemo(() => {
    if (!results.length) return []

    if (filter.sortBy === 'relevance') {
      return results
    }

    const resCopy = [...results]
    const sorted = searchService.getSortedResults(resCopy, filter.sortBy)

    return [...sorted]
  }, [results, filter.sortBy])

  // The results on screen belong to searchedTxt, so a different query means the
  // search is still debouncing or in flight and we don't know the outcome yet.
  const isSearchPending = !!filter.txt && filter.txt !== searchedTxt

  // Browsing renames the sheet header; searching leaves the host's own title.
  const getSheetTitle = () => {
    if (!browseView) return null
    if (isNutritionBrowseView(browseView))
      return tCategories(`categories.${browseView}`)
    return tCategories(browseView)
  }

  useSlideDialogTitle(getSheetTitle())

  const handleSearch = useCallback(async () => {
    const requestId = ++searchRequestIdRef.current
    try {
      if (!filter.source) {
        showErrorMsg(t('messages.error.search'))
        return
      }
      const regex = new RegExp(filter.txt, 'i')

      if (isNutritionBrowseView(browseView)) {
        setIsLoading(false)
        return
      }

      if (filter.source === searchTypes.meal) {
        const meals = user?.meals
          .map((meal) => itemService.convertMealToItem(meal))
          .filter((meal) =>
            regex.test(itemNameService.getItemSearchText(meal.name))
          )

        if (requestId !== searchRequestIdRef.current) return
        setResults(meals || [])
        setResultsDragable(false)
        setIsLoading(false)
        return
      }

      if (!filter.txt) {
        if (!browseView || isNutritionBrowseView(browseView)) {
          setIsLoading(false)
          return
        }
        if (browseView === 'favorites') {
          setResults(favoriteItems)
          setResultsDragable(true)
        }
        if (browseView === 'meals') {
          setResults(
            user?.meals.map((meal) => itemService.convertMealToItem(meal)) || []
          )
          setResultsDragable(true)
        }
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const matchingFavorites = favoriteItems.filter((item) =>
        regex.test(itemNameService.getItemSearchText(item.name))
      )
      setResults(matchingFavorites)
      setResultsDragable(false)

      const searchQuery: SearchFilter = {
        txt: filter.txt,
        favoriteItems: user?.favoriteItems,
      }

      const res = await searchService.search(searchQuery)
      if (requestId !== searchRequestIdRef.current) return

      const matchedCategory = matchItemCategoryLabel(filter.txt)
      let extra: Item[] = []
      if (matchedCategory) {
        const page = await itemHttpService.queryByCategory({
          category: matchedCategory,
          limit: 40,
          skip: 0,
        })
        extra = page.items || []
      }

      const withFavorites = mergeSearchWithFavorites(matchingFavorites, res)
      const merged = mergeUniqueItems(withFavorites, extra)
      setResults(merged)
      setResultsDragable(false)
      if (user?._id) {
        const next = await recentSearchService.add(user._id, filter.txt)
        setRecentQueries(next)
      }
    } catch {
      showErrorMsg(t('messages.error.search'))
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false)
        setSearchedTxt(filter.txt)
      }
    }
  }, [filter.txt, filter.source, user, favoriteItems, browseView, t])

  const latestHandleSearchRef = useRef(handleSearch)
  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  const debouncedRunSearch = useMemo(
    () =>
      debounce(() => {
        latestHandleSearchRef.current()
      }, 500),
    []
  )

  useEffect(() => {
    debouncedRunSearch()
  }, [filter.txt, user, browseView, debouncedRunSearch])

  useLayoutEffect(() => {
    if (isFirstFilterLayout.current) {
      isFirstFilterLayout.current = false
      return
    }
    scrollSheetToTop(searchRootRef.current)
  }, [filter.txt, filter.sortBy, browseView])

  useEffect(() => {
    return () => debouncedRunSearch.cancel()
  }, [debouncedRunSearch])

  useEffect(() => {
    if (!filter.txt && browseView === 'favorites') {
      setResults(favoriteItems)
    }
  }, [filter.txt, favoriteItems, browseView])

  useEffect(() => {
    if (!user?._id) {
      setRecentQueries([])
      return
    }
    recentSearchService.get(user._id).then(setRecentQueries)
  }, [user?._id])

  // What a view lists with no query. Anything else starts empty so the previous
  // view's items can't show through while the next search runs.
  const getViewItems = (view: BrowseView | null) => {
    if (view === 'favorites') return favoriteItems
    if (view === 'meals') {
      return (
        user?.meals.map((meal) => itemService.convertMealToItem(meal)) || []
      )
    }
    return []
  }

  const showViewItems = (view: BrowseView | null) => {
    setResults(getViewItems(view))
    setResultsDragable(view === 'favorites' || view === 'meals')
  }

  const onClearQuery = () => {
    setIsForward(false)
    setFilter((prev) => ({ ...prev, txt: '' }))
    showViewItems(browseView)
  }

  // Typing the first character enters the results view, emptying it leaves.
  const onFilterChange = (nextFilter: Filter) => {
    const hadQuery = !!filter.txt
    const hasQuery = !!nextFilter.txt
    if (hadQuery !== hasQuery) setIsForward(hasQuery)
    setFilter(nextFilter)
  }

  // Backing out of a category or out of the results both land on the category home.
  const onBack = () => {
    setIsForward(false)
    setBrowseView(null)
    setFilter((prev) => ({ ...prev, txt: '' }))
    showViewItems(null)
  }

  const onItemClick = (item: Item) => {
    setEditMealItem(null)
    setItem(item)
    setIsItemSelected(true)
    setIsCustomLog(false)
  }

  const onFavoriteClick = async (item: Item) => {
    try {
      if (!user) return showErrorMsg(t('messages.error.favorite'))
      if (!item.searchId && !item.items)
        return showErrorMsg(t('messages.error.favorite'))

      await handleFavorite(item, user)
    } catch {
      showErrorMsg(t('messages.error.favorite'))
    }
  }

  const onCloseItemDetails = () => {
    setEditMealItem(null)
    setItem(null)
    setIsItemSelected(false)
    setSelectedMeal(null)
    setIsCustomLog(false)
  }

  const onCustomLog = () => {
    setEditMealItem(null)
    setItem(null)
    setIsCustomLog(true)
    setIsItemSelected(true)
  }

  const dragEnd = async (newItems: Item[], isMeals: boolean = false) => {
    const newFavoriteItems = isMeals
      ? newItems
      : newItems.map((item) => item.searchId)

    const key = isMeals ? 'meals' : 'favoriteItems'

    const newUser = {
      ...user,
      [key]: newFavoriteItems,
    }

    optimisticUpdateUser(newUser as User)
    try {
      await updateUser(newUser as User)
    } catch {
      optimisticUpdateUser(user as User)
    }
  }

  const renderNoResults = () => {
    return (
      <Box className='results'>
        <EmptyState text={t('meals.noResults')} />
      </Box>
    )
  }

  const renderSearchFirst = () => {
    return (
      <Box className='results'>
        <Lottie
          animationData={prefs.isDarkMode ? searchDark : searchLight}
          loop={true}
        />
        <Typography
          variant='h6'
          className='search-first'
        >
          {t('meals.searchFirst')}
        </Typography>
      </Box>
    )
  }

  const renderList = () => {
    // const hasFavorite = user?.favoriteItems?.length !== 0
    const meals =
      user?.meals.map((meal) => itemService.convertMealToItem(meal)) || []

    const sortedMeals = searchService.getSortedResults(meals, filter.sortBy)

    const isShowMeals = !filter.txt && browseView === 'meals'
    const isShowFavorites = !filter.txt && browseView === 'favorites'

    if (!results.length && (isLoading || isSearchPending)) {
      return <SkeletonList />
    } else if (!results.length && filter.txt) {
      return renderNoResults()
    } else if (!results.length && isShowFavorites) {
      return (
        <Box className='results'>
          <EmptyState text={tCategories('emptyFavorites')} />
        </Box>
      )
    } else if (!results.length && isShowMeals) {
      return (
        <Box className='results'>
          <EmptyState text={tCategories('emptyMeals')} />
        </Box>
      )
    } else if (!results.length && !filter.txt && !isShowMeals) {
      return renderSearchFirst()
    }

    const renderErrorImage = (item: Item) => {
      item.image = undefined
      const newResults = results.map((i) =>
        i.searchId === item.searchId ? { ...i, image: undefined } : i
      )
      setResults(newResults)
    }

    return (
      <Box
        className='results'
        ref={resultsRef}
      >
        {isShowMeals && (
          <>
            <Typography
              variant='h6'
              className='bold-header search-header'
            >
              {t('meals.meals')}
            </Typography>
            <CustomList<Item>
              items={sortedMeals}
              getKey={(item) => item.searchId || item._id || ''}
              itemClassName={`search-item-container ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
              isDragable={resultsDragable}
              onReorder={(newItems) => dragEnd(newItems, true)}
              renderLeft={(item) => (
                <div className='left-content macros-image-container'>
                  <MacrosDonut
                    protein={item.macros?.protein}
                    carbs={item.macros?.carbs}
                    fats={item.macros?.fat}
                  />
                  <ListItemIcon className='item-image-container'>
                    {(item.image && (
                      <img
                        src={item.image}
                        alt={itemNameService.getItemDisplayName(
                          item.name,
                          i18n.language
                        )}
                        className='item-image'
                        referrerPolicy='no-referrer'
                        onError={async (e) => {
                          renderErrorImage(item)
                          await imageService.fetchOnError(e, item)
                          loadItems()
                        }}
                      />
                    )) || (
                      <CustomSkeleton
                        variant='circular'
                        width={40}
                        height={40}
                        isDarkMode={prefs.isDarkMode}
                      />
                    )}
                  </ListItemIcon>
                </div>
              )}
              renderPrimaryText={(item) => (
                <div className='hide-text-overflow'>
                  {itemNameService.getItemDisplayName(item.name, i18n.language)}
                </div>
              )}
              renderSecondaryText={(item) => {
                let caloriesToDisplay
                const itemCalories = item.macros.calories

                if (itemCalories) {
                  caloriesToDisplay = +itemCalories
                  caloriesToDisplay = caloriesToDisplay.toFixed(0)
                }

                return `${caloriesToDisplay || 0} kcal`
              }}
              renderRight={(item) => (
                <FavoriteButton
                  isFavorite={searchService.isFavorite(item, user) || false}
                />
              )}
              onItemClick={onItemClick}
              onRightClick={onFavoriteClick}
            />
          </>
        )}
        {!isShowMeals && (
          <>
            {isShowFavorites && (
              <Typography
                variant='h6'
                className='bold-header search-header'
              >
                {tCategories('favorites')}
              </Typography>
            )}
            <CustomList<Item>
              items={sortedResults}
              getKey={(item) => item.searchId || item._id || ''}
              itemClassName={`search-item-container ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
              slideIncomingToTop={!!filter.txt}
              renderLeft={(item) => (
                <div className='left-content macros-image-container'>
                  <MacrosDonut
                    protein={item.macros?.protein}
                    carbs={item.macros?.carbs}
                    fats={item.macros?.fat}
                  />
                  <ListItemIcon className='item-image-container'>
                    {(item.image && (
                      <img
                        src={item.image}
                        alt={itemNameService.getItemDisplayName(
                          item.name,
                          i18n.language
                        )}
                        className='item-image'
                        referrerPolicy='no-referrer'
                        onError={async (e) => {
                          renderErrorImage(item)
                          await imageService.fetchOnError(e, item)
                          loadItems()
                        }}
                      />
                    )) || (
                      <CustomSkeleton
                        variant='circular'
                        width={40}
                        height={40}
                        isDarkMode={prefs.isDarkMode}
                      />
                    )}
                  </ListItemIcon>
                </div>
              )}
              renderPrimaryText={(item) => (
                // <div className='hide-text-overflow'>{item.name}</div>
                <MarqueeText
                  variant='body1'
                  className='primary-text'
                >
                  {itemNameService.getItemDisplayName(item.name, i18n.language)}
                </MarqueeText>
              )}
              renderSecondaryText={(item) => {
                let caloriesToDisplay
                const itemCalories = item.macros.calories

                if (itemCalories) {
                  caloriesToDisplay = +itemCalories
                  caloriesToDisplay = caloriesToDisplay.toFixed(0)
                }

                return `${caloriesToDisplay || 0} kcal`
              }}
              renderRight={(item) =>
                item.type !== 'meal' && (
                  <FavoriteButton
                    isFavorite={searchService.isFavorite(item, user) || false}
                  />
                )
              }
              onItemClick={onItemClick}
              onRightClick={onFavoriteClick}
              isDragable={resultsDragable}
              onReorder={dragEnd}
            />
          </>
        )}
        {isLoading && <SkeletonList />}
      </Box>
    )
  }

  const isCategoryHome = !filter.txt && !browseView
  const isCategoryBrowse = isNutritionBrowseView(browseView)

  // Going deeper comes in from the leading edge, going back mirrors it. Stays
  // empty until the first navigation so it doesn't fight the sheet opening.
  const isRtl = prefs.lang === 'he'
  let slideClass = ''
  if (isForward !== null) {
    slideClass = isForward !== isRtl ? 'from-end' : 'from-start'
  }

  const viewKey = browseView || (filter.txt ? 'search' : 'home')

  return (
    <>
      <Box
        ref={searchRootRef}
        className={`item-search ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      >
        <ItemFilter
          filter={filter}
          onFilterChange={onFilterChange}
          onClearQuery={onClearQuery}
          onCustomLog={onCustomLog}
          onBack={browseView || filter.txt ? onBack : undefined}
          backLabel={tCategories('back')}
        />

        <div
          key={viewKey}
          className={`item-search-view ${slideClass}`.trim()}
        >
          {isCategoryHome && (
            <>
              <RecentSearchChips
                queries={recentQueries}
                onSelect={(query) =>
                  setFilter((prev) => ({ ...prev, txt: query }))
                }
                onRemove={async (query) => {
                  if (!user?._id) return
                  const next = await recentSearchService.remove(user._id, query)
                  setRecentQueries(next)
                }}
                onClearAll={async () => {
                  if (!user?._id) return
                  const next = await recentSearchService.clear(user._id)
                  setRecentQueries(next)
                }}
              />
              <CategoryHome
                categoryCounts={categoryCounts}
                onSelect={(view) => {
                  setIsForward(true)
                  setBrowseView(view)
                  showViewItems(view)
                }}
              />
            </>
          )}

          {isCategoryBrowse && (
            <CategoryBrowse
              category={browseView}
              sortBy={filter.sortBy}
              txt={filter.txt}
              onItemClick={onItemClick}
              onFavoriteClick={onFavoriteClick}
            />
          )}

          {!isCategoryHome && !isCategoryBrowse && renderList()}
        </div>
      </Box>

      <SlideDialog
        open={isItemSelected}
        onClose={onCloseItemDetails}
        component={
          <ItemDetails
            onAddToMealClick={onAddToMealClick}
            isCustomLog={isCustomLog}
          />
        }
        title={isCustomLog ? t('meals.customLog') : t('meals.item')}
        type='full'
      />
    </>
  )
}
