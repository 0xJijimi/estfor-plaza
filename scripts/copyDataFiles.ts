
import { copyFile } from "fs/promises"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
    await copyFile(join(__dirname, '../estfor-contracts/scripts/data/actions.ts'), join(__dirname, '../src/data/actions.ts'))

    await copyFile(join(__dirname, '../estfor-contracts/scripts/data/items.ts'), join(__dirname, '../src/data/items.ts'))

    await copyFile(join(__dirname, '../estfor-contracts/scripts/data/actionChoices.ts'), join(__dirname, '../src/data/actionChoices.ts'))
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})