import { createHash } from "node:crypto";

const flag = process.argv[2];

if (!flag) {
  console.error('Usage: node scripts/hash-flag.mjs "ACD{your_flag}"');
  process.exit(1);
}

console.log(createHash("sha256").update(flag.trim(), "utf8").digest("hex"));
