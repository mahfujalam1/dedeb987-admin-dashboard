export const vendors = [
  { id: 'v-01', name: 'Maison Noir Hair Atelier' },
  { id: 'v-02', name: 'Velvet Row' },
  { id: 'v-03', name: 'Root & Reign' },
  { id: 'v-04', name: 'Atelier Blanc' },
]
export const vendorById = (id: string) => vendors.find(v => v.id === id)
