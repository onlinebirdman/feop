import path from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import { program } from 'commander'

// 初始化命令
program
  .command('init')
  .description('Initialize the project configuration')
  .action(() => {
    const configPath = path.join(process.cwd(), 'config.json')
    console.log('process.cwd()', process.cwd())
    // 创建.pont文件夹及相关文件
    createFiles(path.join(process.cwd())) // 复制
    // 修改gitignore 添加.pont
    rewriteGitignore(process.cwd())
  })

program.parse(process.argv)

function rewriteGitignore(p: string) {
  // 确保.pont 不重复
  if (fs.existsSync(path.join(p, '.gitignore'))) {
    const gitignore = fs.readFileSync(path.join(p, '.gitignore'), 'utf-8')
    if (gitignore.includes('.pont'))
      return
  }
  fs.appendFileSync(path.join(p, '.gitignore'), '\n.pont')
}

function createFiles(p: string) {
  const target = path.join(p, '.pont')
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0)
    return
  fs.copySync('./src/preset', target) // 复制
}
