import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ListItemIcon } from '@mui/material'
import { RootState } from '../../store/store'
import {
  handleFavorite,
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setItem } from '../../store/actions/item.actions'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SkeletonList } from '../../components/SkeletonList/SkeletonList'
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton'
import { User } from '../../types/user/User'
import { Item } from '../../types/item/Item'
import { SlideDialog } from '../../components/SlideDialog/SlideDialog'
import { ItemDetails } from '../../components/ItemDetails/ItemDetails'
import { MacrosDonut } from '../../components/MacrosDonut/MacrosDonut'

export function FavoriteItemsCard() {
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const isLoading = useSelector(
    (storeState: RootState) => storeState.systemModule.isLoading
  )

  const favoriteItems = useSelector(
    (storeState: RootState) => storeState.itemModule.favoriteItems
  )
  const [isItemSelected, setIsItemSelected] = useState<boolean>(false)

  const onSelectItem = (item: Item) => {
    setIsItemSelected(true)
    setItem(item)
  }

  const onCloseItemDetails = () => {
    setIsItemSelected(false)
  }

  const onReorder = async (newItems: Item[]) => {
    try {
      const newFavoriteItems = newItems.map((item) => item.searchId)
      const newUser = { ...user, favoriteItems: newFavoriteItems }
      optimisticUpdateUser(newUser as User)
      await updateUser(newUser as User)
    } catch (err) {
      console.error(err)
      optimisticUpdateUser(user as User)
    }
  }

  if (!favoriteItems.length && isLoading) {
    return <SkeletonList />
  }

  if (!favoriteItems.length) {
    return (
      <div className="no-results-container">
        <span>No favorite items found</span>
      </div>
    )
  }

  return (
    <>
      <CustomList
        items={favoriteItems || []}
        // dragOffsetY={-64}
        renderPrimaryText={(item) => item.name}
        renderLeft={(item) => (
          <div className="left-content macros-image-container">
            <MacrosDonut
              protein={item.macros?.protein}
              carbs={item.macros?.carbs}
              fats={item.macros?.fat}
            />
            <ListItemIcon className="item-image-container">
              <img src={item.image} alt={item.name} className="item-image" />
            </ListItemIcon>
          </div>
        )}
        renderRight={(item) =>
          item.searchId ? (
            <FavoriteButton
              isFavorite={user?.favoriteItems?.includes(item.searchId) || false}
            />
          ) : null
        }
        onRightClick={(item) => {
          handleFavorite(item, user as User)
        }}
        onItemClick={onSelectItem}
        isDragable={true}
        onReorder={onReorder}
      />
      <SlideDialog
        open={isItemSelected}
        onClose={onCloseItemDetails}
        component={<ItemDetails />}
        title="Item"
        type="full"
      />
    </>
  )
}
