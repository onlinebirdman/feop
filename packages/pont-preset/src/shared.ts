import fsExtra from 'fs-extra'

/**
 * 复制一个文件夹及其所有内容到另一个位置。
 * @param source 源文件夹路径
 * @param destination 目标文件夹路径
 */
function copyFolder(source: string, destination: string): void {
  try {
    fsExtra.copySync(source, destination)
    console.info(`Successfully copied folder from ${source} to ${destination}`)
  }
  catch (error) {
    console.error(`Failed to copy folder: ${error}`)
  }
}

// 示例调用
const sourceFolder = '/path/to/source/folder'
const destinationFolder = '/path/to/destination/folder'
copyFolder(sourceFolder, destinationFolder)
