import fs from 'fs'
import path from 'path'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { ProductSchema } from '../src/schemas/product'
import { SellerSchema } from '../src/schemas/seller'
import { BuyerSchema } from '../src/schemas/buyer'
import { OrderSchema } from '../src/schemas/order'
import { ShipmentSchema } from '../src/schemas/shipment'

const outDir = path.resolve(__dirname, '../dist/schemas')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const schemas = {
  Product: ProductSchema,
  Seller: SellerSchema,
  Buyer: BuyerSchema,
  Order: OrderSchema,
  Shipment: ShipmentSchema,
}

for (const [name, schema] of Object.entries(schemas)) {
  const json = zodToJsonSchema(schema, name)
  const outPath = path.join(outDir, `${name}.json`)
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2))
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`)
}
