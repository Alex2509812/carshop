/**
 * Genera todas las combinaciones de tamaño `r` de un array.
 * Equivalente a itertools.combinations de Python.
 */
export function combinations(arr, r) {
  const result = [];
  const n = arr.length;
  if (r > n || r <= 0) return result;

  const combo = Array(r);
  const start = Date.now();

  function backtrack(startIdx, depth) {
    // Límite de seguridad: no más de 200ms por llamada
    if (Date.now() - start > 200) return;
    if (depth === r) {
      result.push([...combo]);
      return;
    }
    for (let i = startIdx; i <= n - (r - depth); i++) {
      combo[depth] = arr[i];
      backtrack(i + 1, depth + 1);
    }
  }

  backtrack(0, 0);
  return result;
}
