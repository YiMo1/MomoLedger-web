import { type DBSchema, openDB as _openDB } from 'idb'

export type Account = {
  id?: number
  name?: string
  balance?: number
  note?: string
  type?: '资产' | '信贷'
  limit?: number
}

export type LedgerRecord = {
  id?: number
  expenses?: number
  note?: string
  statementDate?: number
  account?: Account['id']
  createTime?: number
  discount?: number
  category?: Category['id']
  type?: '支出' | '收入' | '转账'
}

export type Category = {
  id?: number
  text?: string
  parent?: number
}

export type Database = {
  account: { key: Account['id']; value: Account }
  'ledger-record': { key: LedgerRecord['id']; value: LedgerRecord }
  category: { key: LedgerRecord['id']; value: Category }
} & DBSchema

export function openDB() {
  return _openDB<Database>('momo-ledger', 1, {
    upgrade(database) {
      database.createObjectStore('account', { keyPath: 'id', autoIncrement: true })
      database.createObjectStore('ledger-record', { keyPath: 'id', autoIncrement: true })
      const categoryStore = database.createObjectStore('category', {
        keyPath: 'id',
        autoIncrement: true,
      })
      const categorys = [
        { id: 1, text: '其它' },
        { id: 2, text: '打印费', parent: 1 },
        { id: 3, text: '物流费', parent: 1 },
        { id: 4, text: '手续费', parent: 1 },
        { id: 5, text: '罚款赔偿', parent: 1 },
        { id: 6, text: '理财支出', parent: 1 },
        { id: 7, text: '慈善捐助', parent: 1 },
        { id: 8, text: '购物消费' },
        { id: 9, text: '日常家居', parent: 8 },
        { id: 10, text: '个护美妆', parent: 8 },
        { id: 11, text: '手机数码', parent: 8 },
        { id: 12, text: '虚拟充值', parent: 8 },
        { id: 13, text: '生活电器', parent: 8 },
        { id: 14, text: '配饰腕表', parent: 8 },
        { id: 15, text: '母婴玩具', parent: 8 },
        { id: 16, text: '服饰运动', parent: 8 },
        { id: 17, text: '宠物用品', parent: 8 },
        { id: 18, text: '办公用品', parent: 8 },
        { id: 19, text: '装修装饰', parent: 8 },
        { id: 20, text: '食品餐饮' },
        { id: 21, text: '水果', parent: 20 },
        { id: 22, text: '早餐', parent: 20 },
        { id: 23, text: '午餐', parent: 20 },
        { id: 24, text: '晚餐', parent: 20 },
        { id: 25, text: '饮料酒水', parent: 20 },
        { id: 26, text: '休闲零食', parent: 20 },
        { id: 27, text: '生鲜食品', parent: 20 },
        { id: 28, text: '请客吃饭', parent: 20 },
        { id: 29, text: '粮油调味', parent: 20 },
        { id: 30, text: '出行交通' },
        { id: 31, text: '打车', parent: 30 },
        { id: 32, text: '公共交通', parent: 30 },
        { id: 33, text: '停车费', parent: 30 },
        { id: 34, text: '加油', parent: 30 },
        { id: 35, text: '火车', parent: 30 },
        { id: 36, text: '飞机', parent: 30 },
        { id: 37, text: '保养修车', parent: 30 },
        { id: 38, text: '休闲娱乐' },
        { id: 39, text: '旅游度假', parent: 38 },
        { id: 40, text: '电影唱歌', parent: 38 },
        { id: 41, text: '运动健身', parent: 38 },
        { id: 42, text: '足浴按摩', parent: 38 },
        { id: 43, text: '棋牌桌游', parent: 38 },
        { id: 44, text: '酒吧', parent: 38 },
        { id: 45, text: '演出', parent: 38 },
        { id: 46, text: '居家生活' },
        { id: 47, text: '话费宽带', parent: 46 },
        { id: 48, text: '电费', parent: 46 },
        { id: 49, text: '水费', parent: 46 },
        { id: 50, text: '燃气费', parent: 46 },
        { id: 51, text: '物业费', parent: 46 },
        { id: 52, text: '房租还贷', parent: 46 },
        { id: 53, text: '车位费', parent: 46 },
        { id: 54, text: '家政清洁', parent: 46 },
        { id: 55, text: '文化教育' },
        { id: 56, text: '教材书籍', parent: 55 },
        { id: 57, text: '学费', parent: 55 },
        { id: 58, text: '书报杂志', parent: 55 },
        { id: 59, text: '培训考试', parent: 55 },
        { id: 60, text: '送礼人情' },
        { id: 61, text: '捐款', parent: 60 },
        { id: 62, text: '孝敬长辈', parent: 60 },
        { id: 63, text: '礼物', parent: 60 },
        { id: 64, text: '借出', parent: 60 },
        { id: 65, text: '红包', parent: 60 },
        { id: 66, text: '打赏', parent: 60 },
        { id: 67, text: '健康医疗' },
        { id: 68, text: '滋补保健', parent: 67 },
        { id: 69, text: '医院', parent: 67 },
        { id: 70, text: '买药', parent: 67 },
      ]
      for (const item of categorys) {
        categoryStore.add(item)
      }
    },
  })
}
