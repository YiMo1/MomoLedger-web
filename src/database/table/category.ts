import { pick } from 'es-toolkit'

import type { Data } from '../utils.ts'

interface CategoryOptions {
  id: number
  text: string
  parent?: Category
  icon?: string
}

export class Category implements Data {
  readonly id: number
  text: string
  parent?: Category
  children: Category[] = []
  icon?: string

  constructor({ id, text, parent, icon }: CategoryOptions) {
    this.id = id
    this.text = text
    this.parent = parent
    this.icon = icon
  }

  structured() {
    return {
      ...pick(this, ['id', 'text', 'icon']),
      ...{ parent: this.parent?.id } as { parent?: number },
    }
  }

  addChild(child: Category) {
    this.children.push(child)
  }
}

export type CategoryDTO = ReturnType<Category['structured']>
