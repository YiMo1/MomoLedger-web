import { pick } from 'es-toolkit'

import type { Data } from '../utils.ts'

interface CategoryOptions {
  id: number
  text: string
  parent?: Category
}

export class Category implements Data {
  readonly id: number
  text: string
  parent?: Category
  children: Category[] = []

  constructor({ id, text, parent }: CategoryOptions) {
    this.id = id
    this.text = text
    this.parent = parent
  }

  structured() {
    return {
      ...pick(this, ['id', 'text']),
      ...{ parent: this.parent?.id } as { parent?: number },
    }
  }

  addChild(child: Category) {
    this.children.push(child)
  }
}

export type CategoryDTO = ReturnType<Category['structured']>
