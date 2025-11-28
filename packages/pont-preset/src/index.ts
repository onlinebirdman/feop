#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'

// 定义模板目录
const templateDir = path.resolve(__dirname, './template')

// 初始化 Commander 实例
const program = new Command()

// 定义命令行工具名称和版本
program
  .name('pont-preset')
  .version('1.0.0')
  .description('Generate preset configuration files from templates for Pont')

// 设置默认执行命令
program.action(async () => {
  try {
    // 读取 template 文件夹下的所有文件
    const files = await fs.readdir(templateDir)

    for (const file of files) {
      // 匹配以 .tmp 结尾的模板文件
      if (file.includes('.tmp')) {
        const targetFile = file.replace('.tmp', '') // 去掉 .tmp
        const targetPath = path.resolve(process.cwd(), `.pont/${targetFile}`) // 在当前工作目录生成文件

        // 检查目标文件是否已存在
        if (!(await fileExists(targetPath))) {
          const templateContent = await fs.readFile(path.join(templateDir, file), 'utf8')
          await fs.writeFile(targetPath, templateContent, 'utf8')
          console.log(`Created ${targetFile} at ${targetPath}`)
        }
        else {
          console.log(`${targetFile} already exists`)
        }
      }
    }
  }
  catch (error) {
    console.error('Error creating files:', error)
  }
})

// 工具函数：检查文件或文件夹是否存在
async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath)
    return true
  }
  catch {
    return false
  }
}

// 解析命令行参数
program.parse(process.argv)
