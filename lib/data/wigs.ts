import type { Wig } from '@/lib/types'
const CDN = 'https://cdn.magicpatterns.com/patterns/generated-images'
export const wigs: Wig[] = [
  { id: 'w-01', name: 'Aurelia Body Wave', brand: 'Maison Noir', vendorId: 'v-01', price: 480, images: [`${CDN}/6286fc8f-ef59-4e90-bf7e-7a1e817f7050.jpg`] },
  { id: 'w-02', name: 'Cleo Blunt Bob', brand: 'Maison Noir', vendorId: 'v-01', price: 320, salePrice: 268, images: [`${CDN}/36c5a6df-6e0a-495e-9078-9cf20860b5dc.jpg`] },
  { id: 'w-03', name: 'Solene Honey Curl', brand: 'Velvet Row', vendorId: 'v-02', price: 395, images: [`${CDN}/d655dd91-6d3f-424d-97fb-841668fbfc9a.jpg`] },
  { id: 'w-04', name: 'Margaux Wine Silk', brand: 'Velvet Row', vendorId: 'v-02', price: 610, images: [`${CDN}/6ae81460-2a25-47ef-94eb-d50cdda9a536.jpg`] },
  { id: 'w-05', name: 'Nia Coil Crown', brand: 'Root & Reign', vendorId: 'v-03', price: 285, images: [`${CDN}/d7304414-4172-4d86-855f-f7c73adf1efa.jpg`] },
  { id: 'w-06', name: 'Ivo Platinum Crop', brand: 'Atelier Blanc', vendorId: 'v-03', price: 340, images: [`${CDN}/f25e829e-97e4-4a48-8cf6-9d606a7247eb.jpg`] },
  { id: 'w-07', name: 'Rousse Copper Wave', brand: 'Root & Reign', vendorId: 'v-04', price: 425, images: [`${CDN}/f4b295db-7569-4809-b4af-5cfc177968b6.jpg`] },
  { id: 'w-08', name: 'Océane Deep Wave', brand: 'Maison Noir', vendorId: 'v-04', price: 720, images: [`${CDN}/6b4ec545-f1b5-4acf-808f-0b5d8f685191.jpg`] },
  { id: 'w-09', name: 'Sable Kinky Straight', brand: 'Maison Noir', vendorId: 'v-01', price: 560, images: [`${CDN}/9c623780-1039-46a3-b4ff-4c155743f28a.jpg`] },
  { id: 'w-10', name: 'Celine Auburn Closure', brand: 'Velvet Row', vendorId: 'v-02', price: 390, images: [`${CDN}/fdb95611-11a0-4dbb-99e2-9e893fc9fa8e.jpg`] },
]
export const wigById = (id: string) => wigs.find(w => w.id === id)
