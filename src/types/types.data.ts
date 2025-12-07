export type cosmosItem = {
  name: string,
  permission: boolean,
  crashIndex?: string,
  hesitationIndex?: string
}

export type cosmosType = {
  numbers: cosmosItem[],
  fiveElements: cosmosItem[],
  musicTherapy: boolean
}