const { ReturnCodes } = require('./returnCodes');
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

/*
===============================================================
FUNCTION:
  verifyEntry(entry)

DESCRIPTION:
  Accepts an entry and checks if it's a valid entry with
  all the necessary properties.
===============================================================
*/
const verifyEntry = (entry) => {
  if (entry.id && entry.name && entry.type && entry.description) {
    if (typeof entry.id === 'number'){
      if (typeof entry.name === 'string'){
        if (typeof entry.description === 'string'){
          if (entry.type instanceof Array) {
            for (let type of entry.type) {
              if (typeof type !== 'string') {
                return ReturnCodes.NOT_A_STRING;
              }
            }
            return ReturnCodes.SUCCESS;
          } else {
            return ReturnCodes.NOT_AN_ARRAY;
          }
        } else {
          return ReturnCodes.NOT_A_STRING;
        }
      } else {
        return ReturnCodes.NOT_A_STRING;
      }
    } else {
      return ReturnCodes.NOT_A_NUMBER;
    }
  };
  return ReturnCodes.GENERAL_FAILURE;
}

module.exports = {
  findIndexById,
  verifyEntry
}