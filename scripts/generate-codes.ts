import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

import { createCandidateRecord, loadRegistry, saveRegistry } from "@/lib/auth";

const ANIMALS = [
  "antelope",
  "badger",
  "beaver",
  "buffalo",
  "cheetah",
  "cougar",
  "dolphin",
  "eagle",
  "elephant",
  "falcon",
  "fox",
  "gazelle",
  "heron",
  "ibis",
  "jaguar",
  "koala",
  "lemur",
  "lynx",
  "meerkat",
  "narwhal",
  "otter",
  "panda",
  "panther",
  "quetzal",
  "raven",
  "seal",
  "tiger",
  "walrus",
  "wolf",
  "yak",
  "zebra",
];

function getArg(flag: string, fallback: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

function base32Token(length: number) {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = randomBytes(length);
  let token = "";

  for (let index = 0; index < length; index += 1) {
    token += alphabet[bytes[index] % alphabet.length];
  }

  return token;
}

function pickAnimal() {
  return ANIMALS[randomBytes(1)[0] % ANIMALS.length];
}

function outputDir() {
  const dir = getArg("--output-dir", join(process.cwd(), ".runtime", "admin"));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const count = Number(getArg("--count", "10"));
const maxLevel = Number(getArg("--max-level", "2"));
const randomLength = Number(getArg("--random-length", "20"));
const nowIso = new Date().toISOString();
const registry = loadRegistry();
const issuedRows: string[] = ["candidate_id,code,max_level,created_at"];
const existingCodes = new Set<string>();
const csvPath = join(outputDir(), `generated-codes-${nowIso.replace(/[:.]/g, "-")}.csv`);

for (let index = 0; index < count; index += 1) {
  let code = "";

  while (!code || existingCodes.has(code)) {
    code = `${pickAnimal()}-${base32Token(randomLength)}`;
  }

  existingCodes.add(code);
  const candidate = createCandidateRecord(code, maxLevel, nowIso);
  registry.candidates.push(candidate);
  issuedRows.push(`${candidate.candidate_id},${code},${maxLevel},${nowIso}`);
}

saveRegistry(registry);
writeFileSync(csvPath, `${issuedRows.join("\n")}\n`);

process.stdout.write(
  JSON.stringify(
    {
      generated: count,
      max_level: maxLevel,
      csv_path: csvPath,
      registry_candidates: registry.candidates.length,
    },
    null,
    2,
  ),
);
