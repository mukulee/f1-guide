// ── F1 车手姓名中英文映射 ──────────────────────
// key = Ergast/Jolpica API 返回的 familyName
// 覆盖 2020-2026 主要车手

export const DRIVER_CN = {
  // 2026 梅赛德斯
  'Antonelli'   : '安东内利',
  'Russell'     : '罗素',

  // 2026 法拉利
  'Leclerc'     : '勒克莱尔',
  'Hamilton'    : '汉密尔顿',

  // 2026 迈凯轮
  'Norris'      : '诺里斯',
  'Piastri'     : '皮亚斯特里',

  // 2026 红牛
  'Verstappen'  : '维斯塔潘',
  'Hadjar'      : '哈德贾尔',

  // 2026 阿尔派
  'Gasly'       : '加斯利',
  'Colapinto'   : '科拉平托',

  // 2026 RB
  'Lawson'      : '劳森',
  'Lindblad'    : '林德布拉德',

  // 2026 哈斯
  'Bearman'     : '贝尔曼',
  'Ocon'        : '奥康',

  // 2026 威廉姆斯
  'Sainz'       : '赛恩斯',
  'Albon'       : '阿尔邦',

  // 2026 奥迪
  'Bortoleto'   : '博尔托莱托',
  'Hülkenberg'  : '休尔肯贝格',
  'Hulkenberg'  : '休尔肯贝格',

  // 2026 凯迪拉克
  'Bottas'      : '博塔斯',
  'Pérez'       : '佩雷斯',
  'Perez'       : '佩雷斯',

  // 2026 阿斯顿·马丁
  'Stroll'      : '斯特罗尔',
  'Alonso'      : '阿隆索',

  // 历史车手（保留）
  'Tsunoda'     : '角田裕毅',
  'Ricciardo'   : '里卡多',
  'Zhou'        : '周冠宇',
  'Magnussen'   : '马格努森',
  'Schumacher'  : '舒马赫',
  'Raikkonen'   : '莱科宁',
  'Räikkönen'   : '莱科宁',
  'Vettel'      : '维特尔',
  'Rosberg'     : '罗斯伯格',
  'Button'      : '巴顿',
  'Webber'      : '韦伯',
}

// 车队名称中文映射（2026 赛季新增 Audi / Cadillac）
export const TEAM_CN = {
  'Mercedes'           : '梅赛德斯',
  'Ferrari'            : '法拉利',
  'McLaren'            : '迈凯轮',
  'Red Bull'           : '红牛',
  'Alpine F1 Team'     : '阿尔派',
  'Alpine'             : '阿尔派',
  'RB F1 Team'         : 'RB车队',
  'RB'                 : 'RB车队',
  'Haas F1 Team'       : '哈斯',
  'Haas'               : '哈斯',
  'Williams'           : '威廉姆斯',
  'Audi'               : '奥迪',
  'Cadillac F1 Team'   : '凯迪拉克',
  'Cadillac'           : '凯迪拉克',
  'Aston Martin'       : '阿斯顿·马丁',
  // 历史
  'Kick Sauber'        : '索伯',
  'Sauber'             : '索伯',
  'AlphaTauri'         : '阿尔法·陶里',
  'Alfa Romeo'         : '阿尔法·罗密欧',
  'Racing Bulls'       : 'RB车队',
  'Force India'        : '印度力量',
  'Renault'            : '雷诺',
  'Toro Rosso'         : '红牛二队',
}

/**
 * 把 API 返回的车手对象转换为中文姓名
 * @param {{ givenName: string, familyName: string }} driver
 */
export function toChineseName(driver) {
  if (!driver) return '—'
  return DRIVER_CN[driver.familyName] ?? `${driver.givenName} ${driver.familyName}`
}

/**
 * 把 API 返回的车队名转换为中文
 * @param {string} name  Constructor.name
 */
export function toChineseTeam(name) {
  if (!name) return '—'
  return TEAM_CN[name] ?? name
}
