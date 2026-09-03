import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

import { Item } from '../../types/item/Item'
import { ItemCategoriesEditor } from '../../components/ItemSearch/ItemCategoriesEditor/ItemCategoriesEditor'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { itemNameService } from '../../services/item/item-name.service'
import { ItemCategoryId } from '../../assets/config/item-categories'
import { getApiBaseUrl } from '../../services/http.service'
import { itemSearchCategoriesNs } from '../../components/ItemSearch/locals'
import { itemPlaygroundNs } from './locals'

const PLAYGROUND_KEY =
  import.meta.env.VITE_PLAYGROUND_KEY || 'dev-playground'

interface PlaygroundList {
  items: Item[]
  total: number
  page: number
  limit: number
}

function ItemPlaygroundComponent() {
  const { t, i18n } = useTranslation(itemPlaygroundNs)
  const { t: tCategories } = useTranslation(itemSearchCategoriesNs)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [selected, setSelected] = useState<Item | null>(null)
  const [status, setStatus] = useState('')

  async function load() {
    const res = await axios.get<PlaygroundList>(
      `${getApiBaseUrl()}item/admin/list`,
      {
        params: { q, category: category || undefined, limit: 40, page: 0 },
        headers: { 'x-playground-key': PLAYGROUND_KEY },
      }
    )
    setItems(res.data.items || [])
  }

  useEffect(() => {
    load().catch(() => setStatus(t('loadError')))
  }, [])

  async function save() {
    if (!selected) return
    await axios.post(`${getApiBaseUrl()}item/admin/save`, selected, {
      headers: { 'x-playground-key': PLAYGROUND_KEY },
    })
    setStatus(t('saved'))
    await load()
  }

  return (
    <div className='item-playground-container'>
      <h2>{t('title')}</h2>
      <div className='item-playground-filters'>
        <CustomInput
          value={q}
          onChange={setQ}
          placeholder={t('search')}
        />
        <CustomInput
          value={category}
          onChange={setCategory}
          placeholder={tCategories('browse')}
        />
        <CustomButton
          text={t('load')}
          onClick={() => load().catch(() => setStatus(t('loadError')))}
        />
      </div>
      {status && <p>{status}</p>}
      <div className='item-playground-layout'>
        <ul className='item-playground-list'>
          {items.map((item) => (
            <li key={item._id || item.searchId}>
              <button
                type='button'
                onClick={() => setSelected(item)}
              >
                {itemNameService.getItemDisplayName(item.name, i18n.language)}
              </button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className='item-playground-editor'>
            <h3>
              {itemNameService.getItemDisplayName(selected.name, i18n.language)}
            </h3>
            <ItemCategoriesEditor
              value={selected.categories || []}
              onChange={(categories: ItemCategoryId[]) =>
                setSelected({ ...selected, categories })
              }
            />
            <CustomButton
              text={t('save')}
              onClick={() => save().catch(() => setStatus(t('saveError')))}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export const ItemPlayground = ItemPlaygroundComponent
