/*
===============================================================
FUNCTION:
  findIndexById(id, array)

DESCRIPTION:
  Accepts an id and the array to find it on and
  returns an index if it exists, else it returns -1.
===============================================================
*/
const findIndexById = (id, arr) => {
  const index = arr.findIndex(entry => entry.id === id);
  return index;
}

module.exports = {
  findIndexById
}