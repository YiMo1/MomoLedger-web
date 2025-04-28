import { isUndefined } from 'es-toolkit'

import { Category, type CategoryDTO, DB } from '../database/index.ts'

import type { Except } from 'type-fest'

export const useCategoryStore = defineStore('category', () => {
  const list = ref<Category[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id, item])))

  function buildCategory(options: CategoryDTO) {
    const category = new Category({
      ...options,
      parent: isUndefined(options.parent) ? options.parent : map.value.get(options.parent),
    })
    category.parent && category.parent.addChild(category)
    return category
  }

  async function loadCategorys() {
    list.value = (await DB.getAll('category')).map((item) => buildCategory(item))
  }

  async function createCategory(options: Except<CategoryDTO, 'id'>) {
    const id = await DB.add('category', options as CategoryDTO)
    list.value.push(buildCategory({ ...options, id }))
    return id
  }

  async function deleteCategory(id: Category['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      return DB.delete('category', id)
    }
  }

  async function updateCategory(data: Category) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      list.value[index] = data
      return DB.put('category', data.structured())
    }
  }

  return { list, map, createCategory, deleteCategory, updateCategory, loadCategorys }
})
