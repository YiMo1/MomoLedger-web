import { isUndefined } from 'es-toolkit'

import { Category, type CategoryDTO, DB } from '../database/index.ts'

import type { Except } from 'type-fest'

export const useCategoryStore = defineStore('category', () => {
  const list = ref<Category[]>([])
  const map = ref(new Map<Category['id'], Category>())

  function buildCategory(options: CategoryDTO) {
    const category = new Category({
      ...options,
      parent: isUndefined(options.parent) ? options.parent : map.value.get(options.parent),
    })
    category.parent && category.parent.addChild(category)
    return category
  }

  async function loadCategorys() {
    const categorys = await DB.getAll('category')
    const cacheMap = new Map<Category['id'], Category['id']>()
    list.value = categorys.map((item) => {
      item.parent && cacheMap.set(item.id, item.parent)
      return new Category({ ...item, parent: undefined })
    })
    map.value = new Map(list.value.map((item) => [item.id, item]))
    for (const [id, parentId] of cacheMap.entries()) {
      const item = map.value.get(id)!
      item.parent = map.value.get(parentId)!
      item.parent.addChild(item)
    }
  }

  async function createCategory(options: Except<CategoryDTO, 'id'>) {
    const id = await DB.add('category', options as CategoryDTO)
    const category = buildCategory({ ...options, id })
    list.value.push(category)
    map.value.set(category.id, category)
    return id
  }

  async function deleteCategory(id: Category['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      map.value.delete(id)
      return DB.delete('category', id)
    }
  }

  async function updateCategory(data: Category) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      list.value[index] = data
      map.value.set(data.id, data)
      return DB.put('category', data.structured())
    }
  }

  return { list, map, createCategory, deleteCategory, updateCategory, loadCategorys }
})
