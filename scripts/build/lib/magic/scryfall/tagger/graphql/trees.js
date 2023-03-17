/**
 * Flatten tree-structures into ancestor/child unstructured data
 */
export function flattenTags(tagData, by='parentId') {
  /**
   * Filter for tag by uuid
   */
  function getTagById(id) {
    return tagData
      ?.filter(({ uid }) => uid == id)
      ?.map(({ id, childTags, ...rest }) => rest)
      ?.[0];
  };

  // Construct flat node-tree.
  const tree = tagData
    .map(({ uid, childTags }) => {
      if (!childTags?.length) return;
      return childTags
        .map(id => ({
          uid: id,
          parentId: uid || '',
          ...(getTagById(id) || {})
        })).filter(
          ({ uid, parentId, ...rest }) =>
            Object.keys(rest)?.length
        );
    }).filter(Boolean)
      ?.flat(1);
  
  // Construct tree map
  const treeMap = new Map();
  
  // Loop through each node, find its parent node, and place it in an array    
  tree.forEach(node => {
    // map has parent data, insert, no, build and insert   
    treeMap.has(node.parentId)
      ? treeMap.get(node.parentId).push(node)
      : treeMap.set(node.parentId, [node]);
  })

  // Tree First Layer  
  const treeRoots = [];
  
  // Loop through each node to find its children.
  tree.forEach(node => {
    // Insert children into current node.
    node.children = (treeMap.get(node.uid) || []);
    // If a node does not have a parent, insert into the first level array
    if (!node.parentId) treeRoots.push({ node });
  });
    
  // Store tree structure as object array.
  let treeData = Array.from(treeMap, ([uid, children]) => ({
    uid, ...getTagById(uid), children
  }));

  /**
   * Remove all specified keys from the nested tree object recursively in place.
   */
  function pruneTree (obj, keys) {
    if (obj === Object(obj)) return obj;
    return Array.isArray(obj)
      // Call function for each object in the array.
      ? obj.map((item) => pruneTree(item, keys))
      // Filter keys if not an array.
      : Object.keys(obj)
        .filter((k) => !keys.includes(k))
        .reduce(
          (acc, x) => {
            const value = pruneTree(obj[x], keys);
            const object = Object.assign(acc, { [x]: value });

            return pruneObjectKeys(object);
          },
          {}
        );
  };

  // Remove unnecessary props after tree construction.
  return pruneTree(treeData, by);
};