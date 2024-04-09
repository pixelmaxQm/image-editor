import { IUI } from '@leafer-ui/interface';
import { nanoid } from 'nanoid';
import { BaseLayer, GroupLayer, BasePage } from '../types/data';

/**
 * 生成一个不重复的ID
 * @returns
 */
export function createID(n?: number): string {
  return nanoid(n ? n : 10);
}

export function setURL(url: string, resourceHost: string) {
  if (/(http:\/\/|https:\/\/)/.test(url)) {
    return url;
  } else {
    return resourceHost + url;
  }
}

/**
 * 随机
 * @param randomLength
 * @returns
 */
export function randomID(randomLength = 8): string {
  return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
}

export function toJS(obj: Record<string, any> | any[]) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error('toJS数据异常', err, obj);
  }
}

function cloneDataLoop(layers: BaseLayer[]) {
  layers.forEach(layer => {
    layer._dirty = randomID();
    if ((layer as GroupLayer).childs) {
      cloneDataLoop((layer as GroupLayer).childs);
    }
  });
}
export function cloneData(data: BasePage) {
  const newData = toJS(data) as BasePage;
  cloneDataLoop(newData.layers);
  return newData;
}

export function getIdsFromUI(target: IUI | IUI[]) {
  if (target instanceof Array) {
    return target.map(d => d.id);
  } else {
    return [target.id];
  }
}

/**
 * 对象数据拷贝
 * 将对象obj1的数据拷贝到obj2
 */
export function objectCopyValue(obj1: Record<string, any>, obj2: Record<string, any>) {
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === 'object' && !Array.isArray(obj1[key])) {
        // 如果当前属性是一个对象（非数组），则递归调用copyValues
        obj2[key] = objectCopyValue(obj1[key], obj2[key] || {});
      } else {
        // 否则直接复制值
        obj2[key] = obj1[key];
      }
    }
  }
  return obj2;
}

/**
 * 加载字体
 * @param fontFamily
 * @param url
 */
if (!(window as any)._hasLoadFonts) {
  (window as any)._hasLoadFonts = {};
}
export async function loadFont(fontFamily: string, url: string) {
  if ((window as any)._hasLoadFonts[fontFamily]) {
    console.log('该字体已加载', fontFamily);
    return true;
  }
  (window as any)._hasLoadFonts[fontFamily] = true;

  if (fontFamily && !url) {
    url = `/assets/fonts/${fontFamily}/font.woff`;
  }
  console.log('url', url);
  if (url) {
    const prefont = new FontFace(fontFamily, `url("${url}")`);
    try {
      const res = await prefont.load();
      document.fonts.add(res);
      return true;
    } catch (err) {
      console.error('字体资源加载异常', url);
    }
  } else {
    console.error('字体资源文件不存在');
  }
  return false;
}

/**
 * 通过id获取父元素对象
 * @param arr
 * @param id
 * @returns
 */
export function findParentById(arr: GroupLayer[], id: string) {
  for (let i = 0; i < arr.length; i++) {
    const currentElement = arr[i];

    // 检查当前元素是否包含子元素
    if (currentElement.childs && currentElement.childs.length > 0) {
      // 递归调用，查找子元素中是否包含指定的 id
      const childResult = findParentById(currentElement.childs as GroupLayer[], id);

      // 如果找到了，返回当前元素作为父元素
      if (childResult) {
        return currentElement;
      }
    }

    // 检查当前元素是否是目标元素
    if (currentElement.id === id) {
      return null; // 如果当前元素就是目标元素，说明没有父元素，返回 null
    }
  }

  return null; // 如果没有找到匹配的元素，返回 null
}

/**
 * 计算图片的最大完整居中显示尺寸
 * @param size
 * @returns
 */
export function calcSizeAndPosition(
  itemSize: { width: number; height: number },
  boxSize: { width: number; height: number },
): { width: number; height: number; x: number; y: number } {
  const res = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };

  const divWidth = boxSize.width;
  const divHeight = boxSize.height;

  const imgWidth = itemSize.width;
  const imgHeight = itemSize.height;

  // 计算图片的最大完整居中显示尺寸
  let maxWidth: number, maxHeight: number;
  const divRatio = divWidth / divHeight;
  const imgRatio = imgWidth / imgHeight;

  if (divRatio > imgRatio) {
    maxHeight = divHeight;
    maxWidth = maxHeight * imgRatio;
  } else {
    maxWidth = divWidth;
    maxHeight = maxWidth / imgRatio;
  }

  if (maxWidth > imgWidth) {
    maxWidth = imgWidth;
  }
  if (maxHeight > imgHeight) {
    maxHeight = imgHeight;
  }

  res.width = maxWidth;
  res.height = maxHeight;
  res.x = (divWidth - maxWidth) / 2;
  res.y = (divHeight - maxHeight) / 2;

  // 居中
  res.x += res.width / 2;
  res.y += res.height / 2;

  return res;
}

/**
 * 取整数
 */
export function toNum(n: number, m?: number) {
  if (m === undefined) {
    m = 0;
  }
  if (n === null || n === undefined) {
    n = 0;
  }
  try {
    let v = Number(n.toFixed(m));
    if (isNaN(v)) {
      v = 0;
    }
    return v;
  } catch (err) {
    console.error(err);
    return 0;
  }
}

/**
 * 通过元素id获取对应的dom元素
 * @param ids
 * @returns
 */
export function getTargetByIds(ids: string[]) {
  //元素选中
  const targets = [] as HTMLElement[];
  ids.forEach(id => {
    const target = document.querySelector(`[data-elementid="${id}"]`) as HTMLElement;
    if (target) {
      // console.dir(target);
      targets.push(target);
    }
  });
  return targets;
}
