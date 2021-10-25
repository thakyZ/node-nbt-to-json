#! /usr/bin/env node
const { Command, Option, InvalidArgumentError } = require("commander");
const fs = require("fs");
const path = require("path");
const nbt = require("prismarine-nbt");
const zlib = require("zlib");

const program = new Command();

function checkFileInput(value, dummyPrevious) {
  return checkFileBoth(value, "input");
}

function checkFileOutput(value, dummyPrevious) {
  return checkFileBoth(value, "output");
}

const resolvePath = function (_path) {
  if (path.isAbsolute(_path)) {
    return path.normalize(_path);
  } else {
    return path.normalize(path.resolve(process.cwd(), _path));
  }
};

function checkFileBoth(value, type) {
  if (type === "input") {
    if (value === "") {
      throw new InvalidArgumentError("No valid input file.");
    } else if (fs.existsSync(resolvePath(value))) {
      return resolvePath(value);
    } else {
      throw new InvalidArgumentError("Not a valid file");
    }
  } else if (type === "output") {
    if (value === "") {
      return resolvePath(
        `${path.basename(
          resolvePath(program.opts().input),
          path.extname(resolvePath(program.opts().input))
        )}.json`
      );
    } else if (fs.existsSync(path.dirname(resolvePath(value)))) {
      return resolvePath(value);
    } else {
      throw new InvalidArgumentError("Not a valid path");
    }
  }
}

/**
 *
 * @param {Array} values
 * @param {string} type
 * @returns string
 */
function checkFileBothArray(values, type) {
  if (type === "input") {
    if (values[0] === "") {
      throw new InvalidArgumentError("No valid input file.");
    } else if (fs.existsSync(resolvePath(values[0]))) {
      return resolvePath(values[0]);
    }
  } else if (type === "output") {
    if (values[1] === "") {
      return resolvePath(
        `${path.basename(
          resolvePath(values[0]),
          path.extname(resolvePath(values[0]))
        )}.json`
      );
    } else if (fs.existsSync(path.dirname(resolvePath(values[1])))) {
      return resolvePath(values[1]);
    }
  }
}

program
  .command("tojson")
  .description(
    "Converts NBT to JSON.\nUsage: nbtjson tojson -i <input> -o <output> [-p <proto>]"
  )
  .requiredOption(
    "-i, --input <filename>",
    "The nbt file to use.",
    checkFileInput
  )
  .addOption(
    new Option(
      "-o, --output <filename>",
      "The file to output json text"
    ).argParser(checkFileOutput)
  )
  .addOption(
    new Option(
      "-p, --proto <proto>",
      "The character set to use for encoding and decoding"
    )
      .choices(["big", "little", "littleVariant"])
      .default("big")
  )
  .action(toJson);

program
  .command("tonbt")
  .description(
    "Converts JSON data to NBT,\nUsage nbtjson tonbt -i <input> -o <output> [-p <proto>]"
  )
  .requiredOption(
    "-i, --input <filename>",
    "The json file to use.",
    checkFileInput
  )
  .addOption(
    new Option(
      "-o, --output <filename>",
      "The file to output nbt data."
    ).argParser(checkFileOutput)
  )
  .addOption(
    new Option(
      "-p, --proto <proto>",
      "The character set to use for encoding and decoding"
    )
      .choices(["big", "little", "littleVariant"])
      .default("big")
  )
  .addOption(new Option("-z, --zip", "compresses the nbt data"))
  .action(toNBT);

program
  .command("test")
  .description(
    "Converts JSON data to NBT,\nUsage nbtjson tonbt -i <input> -o <output> [-p <proto>]"
  )
  .requiredOption(
    "-i, --input <filename>",
    "The json file to use.",
    checkFileInput
  )
  .addOption(
    new Option(
      "-o, --output <filename>",
      "The file to output nbt data."
    ).argParser(checkFileInput)
  )
  .action(test);

function toJson(options) {
  aToJson(options);
}

async function aToJson(options) {
  let new_output = options.output;
  if (options.output === undefined) {
    new_output = checkFileBothArray([options.input, ""], "output");
  }
  const buffer = await fs.promises.readFile(options.input);
  const { parsed } = await nbt.parse(buffer, options.proto);
  const json = JSON.stringify(parsed, null, 2);

  const outBuffer = fs.createWriteStream(new_output);
  outBuffer.write(json);
  outBuffer.end(() => console.log("Written!"));
  console.log("JSON searalized: " + new_output);
}

function toNBT(options) {
  aToNBT(options);
}

async function compress(data) {
  data = await new Promise((resolve, reject) => {
    zlib.gzip(data, (error, compressed) => {
      if (error) {
        reject(error);
      } else {
        resolve(compressed);
      }
    });
  });

  return data;
}

async function aToNBT(options) {
  let new_output = options.output;
  if (options.output === undefined) {
    new_output = checkFileBothArray([options.input, ""], "output");
  }
  const buffer = JSON.parse(await fs.promises.readFile(options.input));
  const outBuffer = fs.createWriteStream(new_output);
  let newBuffer = nbt.writeUncompressed(buffer, options.proto);
  let newerBuffer;
  if (options.zip) {
    newerBuffer = await compress(newBuffer);
  } else {
    newerBuffer = newBuffer;
  }
  outBuffer.write(newerBuffer);
  outBuffer.end(() => console.log("Written!"));
}

program.parse(process.argsv);
