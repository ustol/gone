export interface WreathTypeConfig {
  id: string
  name: string
  description: string
  leafColor: string
  flowerColors: [string, string]
  centerColor: string
  bgColor: string
  petalCount: number
}

export const WREATH_TYPES: WreathTypeConfig[] = [
  {
    id: 'red-rose',
    name: 'Red Rose',
    description: 'Deep red roses — love and eternal devotion',
    leafColor: '#1d5c1d',
    flowerColors: ['#c41230', '#e02040'],
    centerColor: '#ffd700',
    bgColor: '#0a150a',
    petalCount: 5,
  },
  {
    id: 'white-lily',
    name: 'White Lily',
    description: 'Pure white lilies — innocence and peace',
    leafColor: '#2a5a2a',
    flowerColors: ['#e8e8e8', '#ffffff'],
    centerColor: '#f5d060',
    bgColor: '#0c160c',
    petalCount: 6,
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    description: 'Bright sunflowers — warmth and light',
    leafColor: '#2a5010',
    flowerColors: ['#f5b400', '#f5c800'],
    centerColor: '#5c3010',
    bgColor: '#100e00',
    petalCount: 12,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Serene lavender — tranquility and grace',
    leafColor: '#2a3a2a',
    flowerColors: ['#7c5cbf', '#9b7cd4'],
    centerColor: '#d4baf0',
    bgColor: '#0a080f',
    petalCount: 4,
  },
  {
    id: 'chrysanthemum',
    name: 'Chrysanthemum',
    description: 'White chrysanthemums — honour and grief',
    leafColor: '#1e4a1e',
    flowerColors: ['#dcdcdc', '#f0f0f0'],
    centerColor: '#f5e070',
    bgColor: '#0b100b',
    petalCount: 16,
  },
  {
    id: 'orchid',
    name: 'Purple Orchid',
    description: 'Exotic orchids — admiration and strength',
    leafColor: '#1a3a1a',
    flowerColors: ['#8b1a8b', '#b040b0'],
    centerColor: '#f8c8f8',
    bgColor: '#0b080b',
    petalCount: 5,
  },
  {
    id: 'pink-carnation',
    name: 'Pink Carnation',
    description: 'Pink carnations — gratitude and remembrance',
    leafColor: '#1e4828',
    flowerColors: ['#d44488', '#e060a0'],
    centerColor: '#fce8f8',
    bgColor: '#0f080e',
    petalCount: 8,
  },
  {
    id: 'classic-green',
    name: 'Laurel Wreath',
    description: 'Classic laurel — honour and legacy',
    leafColor: '#0d4020',
    flowerColors: ['#d4af37', '#c8a020'],
    centerColor: '#1a6030',
    bgColor: '#050e05',
    petalCount: 6,
  },
  {
    id: 'blue-iris',
    name: 'Blue Iris',
    description: 'Blue iris — wisdom and deep respect',
    leafColor: '#1a3a1a',
    flowerColors: ['#2040b8', '#3050d0'],
    centerColor: '#a8c8f8',
    bgColor: '#05080f',
    petalCount: 6,
  },
  {
    id: 'marigold',
    name: 'Marigold',
    description: 'Golden marigolds — light and celebration of life',
    leafColor: '#1a4010',
    flowerColors: ['#e06010', '#f08020'],
    centerColor: '#f8d030',
    bgColor: '#0e0800',
    petalCount: 12,
  },
  {
    id: 'mixed-bouquet',
    name: 'Mixed Bouquet',
    description: 'Colourful mixed flowers — joyful remembrance',
    leafColor: '#1a4a1a',
    flowerColors: ['#e0408a', '#40a8d0'],
    centerColor: '#f8e060',
    bgColor: '#0a0a0a',
    petalCount: 6,
  },
  {
    id: 'tropical',
    name: 'Tropical Wreath',
    description: 'Vibrant tropical blooms — vibrant spirit',
    leafColor: '#0d4a1a',
    flowerColors: ['#e04820', '#f06840'],
    centerColor: '#f8e000',
    bgColor: '#080e04',
    petalCount: 5,
  },
]

export function getWreathType(id: string): WreathTypeConfig {
  return WREATH_TYPES.find((w) => w.id === id) ?? WREATH_TYPES[0]
}
