import "server-only"

import { createReadStream, createWriteStream } from "node:fs"
import { mkdir, rm, stat } from "node:fs/promises"
import path from "node:path"
import { Readable, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import { env } from "@/server/lib/env"
import { Errors } from "@/server/lib/errors"

const ROOT = path.resolve(env.UPLOAD_DIR)

function resolveKey(key: string) {
  const full = path.resolve(ROOT, key)
  if (!full.startsWith(ROOT + path.sep)) throw Errors.badRequest("Invalid file key")
  return full
}

export async function writeObject(key: string, body: ReadableStream<Uint8Array>, maxBytes: number) {
  const target = resolveKey(key)
  await mkdir(path.dirname(target), { recursive: true })

  let written = 0
  const limit = new Transform({
    transform(chunk: Buffer, _enc, done) {
      written += chunk.length
      if (written > maxBytes) return done(Errors.badRequest("File is larger than declared"))
      done(null, chunk)
    },
  })

  try {
    await pipeline(Readable.fromWeb(body as never), limit, createWriteStream(target))
  } catch (error) {
    await rm(target, { force: true })
    throw error
  }
  return written
}

export async function statObject(key: string) {
  try {
    return await stat(resolveKey(key))
  } catch {
    return null
  }
}

/** Streams a byte range so the video player can seek without downloading the whole file */
export function readObject(key: string, range?: { start: number; end: number }) {
  return Readable.toWeb(createReadStream(resolveKey(key), range)) as ReadableStream<Uint8Array>
}
