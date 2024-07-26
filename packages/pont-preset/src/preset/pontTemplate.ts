import type { Interface } from 'pont-engine'
import { CodeGenerator, FileStructures as OriginFileStructures, Property, Surrounding } from 'pont-engine'

export function reviseModName(modName: string) {
  // .replace(/\//g, '.').replace(/^\../, '').replace(/\../g, '_') 转换 / .为下划线
  // exp: /api/v1/users  => api_v1_users
  // exp: api.v1.users => api_v1_users
  return modName.replace(/\//g, '.').replace(/^\../, '').replace(/\../g, '_')
}
export default class MyGenerator extends CodeGenerator {
  /** 把所有类型的请求参数汇总成payload */
  getPayloadDef(inter: Interface) {
    return `
      ${inter.parameters
        .map((param) => {
          if (!param.dataType.isDefsType)
            return `{${param.toPropertyCode()}}`
          return param.toBody()
        })
        .join(' & ') || '{}'
      }
    `
  }

  /** 把请求的所有参数类型解析成基础类型汇总输出 */
  getParamsList(inter: Interface, dataSource) {
    function walkParameters(parameters, propIn) {
      return parameters.reduce((arr, prop) => {
        if (prop.dataType.isDefsType) {
          const defsType = prop.context.dataSource.baseClasses.find(base => base.name === prop.dataType.typeName)
          if (!defsType) {
            propIn && (prop.in = propIn)
            arr.push(prop)
          }
          else {
            const { properties } = defsType
            arr.push(...walkParameters(properties, prop.in))
          }
        }
        else {
          propIn && (prop.in = propIn)
          arr.push(prop)
        }

        return arr
      }, [])
    }
    return walkParameters(inter.parameters)
    // return JSON.stringify(dataSource)
  }

  /** 获取接口相应类型 */
  getResponseDef(inter: Interface) {
    return inter.responseType === 'any' ? 'never' : inter.responseType
  }

  getInterfaceContentInDeclaration(inter: Interface) {
    const requestParams = inter.getRequestParams()
    const paramsCode = inter.getParamsCode('Params')

    return `
      export ${paramsCode}
      
      export type Response = ${inter.responseType}

      export const init: Response;

      export function request(${requestParams}): Promise<Response>;
    `
  }

  getBaseClassInDeclaration(base: BaseClass) {
    const originProps = base.properties

    base.properties = base.properties.map((prop) => {
      return new Property({
        ...prop,
        required: false,
      })
    })

    const result = super.getBaseClassInDeclaration(base)
    base.properties = originProps

    return result
  }

  /** 生成接口文件内容 */
  getInterfaceContent(inter: Interface) {
    const method = inter.method.toUpperCase()
    const requestParams = inter.getRequestParams(this.surrounding)
    const PayloadDef = this.getPayloadDef(inter)
    const parameters = this.getParamsList(inter, this.dataSource)
    const payloadRequired = parameters.some(item => item.required)
    return `
    /**
     * @desc ${inter.description}
     */

    import pontFetch from '../../pontFetch';

    type Payload = ${PayloadDef}
    const parameters = ${JSON.stringify(parameters, null, 2)}

    export function request(payload${payloadRequired ? '' : '?'}: Payload, options?: FetchConfig) {
      return pontFetch<Payload, ${this.getResponseDef(inter)}>(
        payload,
        {
          path: '${inter.path}',
          method: '${inter.method}',
          parameters,
          ...options,
        },
      );
    }
   `
  }

  /** 获取所有模块的 index 入口文件 */
  getModsIndex() {
    let conclusion = `
      ${this.surrounding === Surrounding.typeScript ? '(window as any)' : 'window'}.API = {
        ${this.dataSource.mods.map(mod => reviseModName(mod.name)).join(', \n')}
      };
    `

    // dataSource name means multiple dataSource
    if (this.dataSource.name) {
      conclusion = `
        export const ${this.dataSource.name} = {
          ${this.dataSource.mods.map(mod => reviseModName(mod.name)).join(', \n')}
        };
      `
    }

    return `
      ${this.dataSource.mods
        .map((mod) => {
          const modName = reviseModName(mod.name)
          return `import * as ${modName} from './${modName}';`
        })
        .join('\n')}
        export {
          ${this.dataSource.mods
        .map((mod) => {
          const modName = reviseModName(mod.name)
          return `
              /** ${mod.description}*/
              ${modName}
              `
        })
        .join(',\n')}
      }
    `
  }

  /** 获取单个模块的 index 入口文件 */
  getModIndex(mod: Mod) {
    return `
      /**
       * @description ${mod.description}
       */
      ${mod.interfaces
        .map((inter) => {
          return `import * as ${inter.name} from './${inter.name}';`
        })
        .join('\n')}

      export {${mod.interfaces.map(inter => `
        /** ${inter.description} */
        ${inter.name}
        `).join(', \n')}
      }
    `
  }

  /** 获取接口类和基类的总的 index 入口文件代码 */
  getIndex() {
    let conclusion = `
      import * as API from './mods/';
      export default API
    `

    // dataSource name means multiple dataSource
    if (this.dataSource.name) {
      conclusion = `
        export { ${this.dataSource.name} } from './mods/';
      `
    }

    return conclusion
  }

  /** 获取公共的类型定义代码 */
  getCommonDeclaration() {
    return ``
  }

  /** 获取总的类型定义代码 */
  getDeclaration() {
    return `
      type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
        [key in Key]: Value;
      }

      ${this.getCommonDeclaration()}

      ${this.getBaseClassesInDeclaration()}

    `
  }
}

export class FileStructures extends OriginFileStructures {
  getFileStructures() {
    const result
      = this.usingMultipleOrigins || this.generators.length > 1
        ? this.getMultipleOriginsFileStructures()
        : this.getOriginFileStructures(this.generators[0])

    // 没解决路径问题，pontFetch先手动加入
    // if (!fs.existsSync(this.baseDir + '/pontFetch.ts')) {
    //   result['pontFetch.ts'] = fs.readFileSync(path.resolve(__dirname, './pontFetch.ts'));
    // }
    delete result['baseClass.ts']
    return result
  }
}
