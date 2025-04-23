import { type Category, DB } from '../database/index.ts'

export const useCategoryStore = defineStore('category', () => {
  const list = ref<Category[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id!, item])))

  DB.getAll('category').then((data) => {
    list.value = data
  })

  async function createCategory(data: Omit<Category, 'id'>) {
    const id = await DB.add('category', data)
    list.value.push({ ...data, id })
    return id
  }

  async function deleteCategory(id: NonNullable<Category['id']>) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      return DB.delete('category', id)
    }
  }

  async function updateCategory(data: Omit<Category, 'id'> & { id: Category['id'] }) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const target = { ...list.value[index], ...data }
      list.value[index] = target
      return DB.put('category', target, target.id)
    }
  }

  return { list, map, createCategory, deleteCategory, updateCategory }
})
