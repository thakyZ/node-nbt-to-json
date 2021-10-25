# node-nbt-to-json

A command line utility to convert Minecraft NBT data to JSON

## Usage

```md
nbtjson <direction> [arguments]

nbtjson toJson [arguments]
               -i, --input <input file>
               -o, --output <output file: <input file>.json>
               -p, --proto <encoding: big>

nbtjson toNBT  [arguments]
               -i, --input <input file>
               -o, --output <output file: <input file>.dat>
               -p, --proto <encoding: big>
               -z, --zip (gzips the nbt file)
```

Author: Neko Boi Nick (thakyZ)
License: [MIT](https://github.com/thakyZ/node-nbt-to-json/LICENSE)

Thanks to [PrismarineJS](https://github.com/PrismarineJS) for [prismarine-nbt](https://www.npmjs.com/package/prismarine-nbt)
