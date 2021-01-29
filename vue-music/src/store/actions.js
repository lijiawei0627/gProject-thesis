import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({ commit, state }, song) {
  // 只能够通过mutations中的方法来修改state中数据的状态
  // 这里处理的数据是引用类型的，虽然复制了一层，但仍然属于直接修改
  // 所以需要再使用slice()方法产生一个新的值的副本
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以插入位置是当前歌曲索引+1
  currentIndex++
  // 插入这首歌到列表
  playlist.splice(currentIndex, 0, song)
  // 如果列表中已经包含了这首歌，则要删除原来列表中的该歌曲
  // fpIndex为原来该歌曲在列表中的位置，currentIndex为准备插入的位置
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      // 插入位置在原来位置的后面，则直接删除原来位置的歌曲，然后因为列表长度减小，要插入的位置也要-1
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 插入位置在原来位置的前面，则因为列表长度边长，则需要将原先获得的fpIndex+1才是原来歌曲的索引
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 当前歌曲在当前播放列表中的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 插入歌曲在当前播放列表中的位置
  let fsIndex = findIndex(sequenceList, song)
  // 当前播放列表中插入歌曲
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({ commit, state }, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 在当前播放列表以及歌曲列表中删除歌曲
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 如果删除的歌曲在当前播放歌曲的前面，或者删除的是最后一首歌，则将当前播放歌曲的索引-1
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  // 提交修改后的状态
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 如果列表被删完了，则将当前播放状态设为暂停
  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

export const deleteSongList = function ({ commit }) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({ commit }, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
