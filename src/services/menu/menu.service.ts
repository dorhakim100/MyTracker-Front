import { httpService } from '../http.service'
import { Menu, MenuFilter } from '../../types/menu/Menu'

const KEY = 'menu'

export const menuService = {
  query,
  getById,
  save,
  remove,
  getEmptyMenu,
  getDefaultFilter,
}

async function query(filter: MenuFilter) {
  try {
    const menus = await httpService.get(KEY, filter)
    return menus
  } catch (err) {
    throw err
  }
}

async function getById(menuId: string) {
  try {
    const menu = await httpService.get(`${KEY}/${menuId}`, null)
    return menu
  } catch (err) {
    throw err
  }
}

async function save(menu: Menu) {
  try {
    if (menu._id) {
      return await httpService.put(`${KEY}/${menu._id}`, menu)
    }
    return await httpService.post(KEY, menu)
  } catch (err) {
    throw err
  }
}

async function remove(menuId: string) {
  try {
    return await httpService.delete(`${KEY}/${menuId}`, null)
  } catch (err) {
    throw err
  }
}

function getEmptyMenu(userId: string): Menu {
  return {
    _id: '',
    userId,
    menuLogs: [],
  }
}

function getDefaultFilter(): MenuFilter {
  return { userId: '' }
}
