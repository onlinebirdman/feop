import { createHash } from 'node:crypto'
import { isFunction as _isFunction, uniqBy as _uniqBy } from 'lodash'
import ora from 'ora'
import fastGlob from 'fast-glob'
import PQueue from 'p-queue'

export function uniqBy<T>(array: T[], iteratee: (item: T) => unknown): T[] {
  const seen = new Map<unknown, T>()

  for (const item of array) {
    const key = iteratee(item)
    if (!seen.has(key)) {
      seen.set(key, item)
    }
  }

  return Array.from(seen.values())
}
export function isFunction(value: unknown): boolean {
  // return _isFunction(value)
  return typeof value === 'function'
}

export function createSingleLineLogger() {
  let count = 0
  const spinner = ora('').start()

  return {
    next: (cb: (count: number) => string) => {
      if (isFunction(cb))
        spinner.text = cb(count++)
      else
        throw new Error('createSingleLineLogger: callback must be a function')
    },
    succeed: (text: string) => spinner.succeed(text),
  }
}

/**
 *
 * @param targetDir 目标目录 [path]/[dir]
 * @returns filepaths [./a/[path]/[filename-a].[ext], ./a/[path]/[filename-b].[ext]]
 */
export async function findImages(targetDir: string): Promise<string[]> {
  const patterns = [`${targetDir}/**/*.{png,jpg,jpeg,gif}`] // 支持的图片扩展名
  try {
    const images = await fastGlob(patterns, { dot: false })
    return images
  }
  catch (err) {
    console.error('Error while searching for images:', err)
    throw err
  }
}

export function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .slice(0, length)
}
type Callback<T extends unknown[]> = (...args: T) => void
export function createWatcherCallback<T extends unknown[]>(cb: Callback<T>) {
  const queue = new PQueue({ concurrency: 1 })
  let timer: NodeJS.Timeout | null = null

  return (...args: T) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      queue.add(() => cb && cb(...args))
    }, 500)
  }
}
