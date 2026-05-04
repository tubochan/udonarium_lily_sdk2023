// 配列のユーティリティ関数（元祖ユドナリウムv1.17.0より移植）
export namespace ArrayUtil {
  // 2つの配列の差分を求める（diff1: array1のみ、diff2: array2のみ）
  export function diff<T>(array1: T[], array2: T[]): { diff1: T[], diff2: T[] } {
    let diff1: T[] = [];
    let diff2: T[] = [];

    let includesInArray1: boolean = false;
    let includesInArray2: boolean = false;

    for (let item of array1.concat(array2)) {
      includesInArray1 = array1.includes(item);
      includesInArray2 = array2.includes(item);
      if (includesInArray1 && !includesInArray2) {
        diff1.push(item);
      } else if (!includesInArray1 && includesInArray2) {
        diff2.push(item);
      }
    }
    return { diff1: diff1, diff2: diff2 };
  }
}
