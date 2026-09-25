import djiboutiFlag from '@/assets/flags/djibouti.svg'
import turkeyFlag from '@/assets/flags/turkey.svg'

export const FLAGS = {
  djibouti: { src: djiboutiFlag, label: 'Drapeau de Djibouti', name: 'Djibouti' },
  turkey: { src: turkeyFlag, label: 'Drapeau de la Turquie', name: 'Turquie' },
} as const

export type FlagId = keyof typeof FLAGS
