import { gameService } from '../../services/game/game.service'
import { store } from '../store'
import { SET_GAMES, SET_GAME, SET_GAME_FILTER } from '../reducers/game.reducer'
import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Item } from '../../types/item/Item'

export async function loadGames(filterBy: ItemFilter): Promise<any> {
  try {
    const games = await gameService.query(filterBy)

    store.dispatch(getCmdSetGames(games))
    store.dispatch({ type: SET_GAME_FILTER, filter: filterBy })
    return games
  } catch (err) {
    // console.log('Cannot load games', err)
    throw err
  }
}

export async function loadGame(gameId: string): Promise<any> {
  try {
    const game = await gameService.getById(gameId)
    store.dispatch(getCmdSetGame(game))
    return game
  } catch (err) {
    // console.log('Cannot load game', err)
    throw err
  }
}

function getCmdSetGames(games: Item[]) {
  return {
    type: SET_GAMES,
    games,
  }
}
function getCmdSetGame(game: Item) {
  return {
    type: SET_GAME,
    game,
  }
}
