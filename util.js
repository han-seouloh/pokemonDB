const { ReturnCodes } = require('./returnCodes');
const userDB = require('./db/users.json');

const typesList = new Set([
  "Bug",
  "Dark",
  "Dragon",
  "Electric",
  "Fairy",
  "Fighting",
  "Fire",
  "Flying",
  "Ghost",
  "Grass",
  "Ground",
  "Ice",
  "Normal",
  "Poison",
  "Psychic",
  "Rock",
  "Steel",
  "Water"
]);

/*
===============================================================
FUNCTION:
  findIndexById(id, array)

DESCRIPTION:
  Accepts an id and the array to find the index of the entry
  with said id.
RETURNS:
  Index (Integer) or -1 (If it doesn't exist)
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

RETURNS:
  ReturnCode (Integer)
===============================================================
*/
const verifyEntry = (entry) => {
  if (entry.id > 0 && entry.name && entry.type && entry.description) {
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
  return ReturnCodes.ERROR;
}

/*
===============================================================
FUNCTION:
  checkQuery(query object)

DESCRIPTION:
  Accepts a query object and checks if it's not empty.

RETURNS:
  ReturnCode (Integer)
===============================================================
*/
const checkQuery = (query) => {
  if (Object.keys(query).length === 0) {
    return ReturnCodes.Q_EMPTY;
  } else {
    if (query.type) {
      return ReturnCodes.Q_TYPE;
    } else if (query.name) {
      return ReturnCodes.Q_NAME;
    } else {
      return ReturnCodes.Q_INVALID;
    }
  }
}

/*
===============================================================
FUNCTION:
  filterByName(name, arr)

DESCRIPTION:
  Accepts a name and searches arr for entries with said name.

RETURNS:
  Entries with said name (Array)
===============================================================
*/
const filterByName = (name, arr) => {
  const query = name.toLowerCase();
  const output = arr.filter(entry => entry.name.toLowerCase().includes(query));

  return output;
}

/*
===============================================================
FUNCTION:
  validType(type)

DESCRIPTION:
  Accepts a type and checks if it's valid.

RETURNS:
  ReturnCode (Integet)
===============================================================
*/
const validType = (type) => {
  if (typesList.has(capitalize(type))) {
    return ReturnCodes.SUCCESS;
  }
  return ReturnCodes.ERROR;
}

/*
===============================================================
FUNCTION:
  filterByType(query object)

DESCRIPTION:
  Accepts a type and searches arr for entries with said type.

RETURNS:
  Entries with said Type (Array)
===============================================================
*/
const filterByType = (type, arr, mode) => {
  const query = capitalize(type);
  let output = arr.filter(entry => entry.type.includes(query));
  if (mode === 1)  {
    output = output.filter(entry => entry.type.length === 1);
  } 
  
  return output;
}

/*
===============================================================
FUNCTION:
  capitalize(str)

DESCRIPTION:
  Receives a string and capitalizes it.

RETURNS:
  Capitalized string (String)
===============================================================
*/
const capitalize = (str) => {
  const lowerCaseString = str.toLowerCase();
  const firstLetter = str.charAt(0).toUpperCase();
  const strWithoutFirstChar = lowerCaseString.slice(1);

  return firstLetter + strWithoutFirstChar; 
}

/*
===============================================================
FUNCTION:
  checkID(id)

DESCRIPTION:
  Receives an id and verifies it's not part of the original 151 entries.

RETURNS:
  ReturnCode (Integer)
===============================================================
*/
const checkID = (id) => {
  if (id < 152) {
    return ReturnCodes.INVALID_ID;
  } else {
    return ReturnCodes.VALID_ID;
  }
}

/*
===============================================================
FUNCTION:
  createError(status, message)

DESCRIPTION:
  Accepts a status code and a message and creates an error obj.
  with said properties.

RETURNS:
  Error (Object)
===============================================================
*/
const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;

  return err;
}

/*
===============================================================
FUNCTION:
  findByUsername(username)

DESCRIPTION:
  Accepts username to find user.

RETURNS:
  Error or User (Object)
===============================================================
*/
const findByUsername = (username, callback) => {
  const user = userDB.find(user => user.username === username);
  let retCode = ReturnCodes.NOT_FOUND;
  let err = new Error(`User with username:${username} does not exist.`);
  err.status = 404;

  if (user) {
    retCode = ReturnCodes.SUCCESS;
    err = null;
  }

  callback(retCode, user, err);
}

/*
===============================================================
FUNCTION:
  authenticateUser(username)

DESCRIPTION:
  Accepts username, password and callback to find user and authenticate.

RETURNS:
  Error or User (Object)
===============================================================
*/
const authenticateUser = (username, password, callback) => {
  const user = userDB.find(user => user.username === username);
  let retCode = ReturnCodes.ERROR;
  let err = new Error('Unknown error...');
  err.status = 400;

  if (user) {
    if (user.password === password) {
      err = null;
      retCode = ReturnCodes.SUCCESS;
    
    } else {
      err = null;
      retCode = ReturnCodes.INVALID_PASSWORD;

    }
  } else {
    err = null
    retCode = ReturnCodes.NOT_FOUND;

  }

  callback(retCode, user, err);
}

/*
===============================================================
FUNCTION:
  function(arg)

DESCRIPTION:
  Lorem..

RETURNS:
  Lorem..
===============================================================
*/
const functionName = () => {
  return 0;
}

/*
################################ MIDDLEWARE FUNCTIONS ####################################
*/

/*
===============================================================
MIDDLEWARE FUNCTION:
  validateEntry(req, res, next)

DESCRIPTION:
  Validates the request body content

RETURNS:
  next() (Express Function)
===============================================================
*/
const validateEntry = (req, res, next) => {
  const retCode = verifyEntry(req.body.entry);
  let err = null;

  switch (retCode) {
    case ReturnCodes.SUCCESS:
      return next();

    case ReturnCodes.ERROR:
      err = createError(400, 'Missing entry properties or invalid id.');
      return next(err);

    case ReturnCodes.NOT_A_NUMBER:
      err = createError(400, 'id property is not a number.');
      return next(err);

    case ReturnCodes.NOT_A_STRING:
      err = createError(400, 'name, description or type array elements are not strings.');
      return next(err);

    case ReturnCodes.NOT_AN_ARRAY:
      err = createError(400, 'type property is not an array.');
      return next(err);
  }
};

/*
===============================================================
MIDDLEWARE FUNCTION:
  middlewareFunctionName(req, res, next)

DESCRIPTION:
  Lorem

RETURNS:
  next() (Express Function)
===============================================================
*/
const isAuthenticated = (req, res, next) => {
  const nonSecurePaths = ['/login', '/register'];
  if (nonSecurePaths.includes(req.path)) {
    if (req.user) return res.redirect('/');
    return next();
  
  } else {
    if (req.user) return next();
    return res.redirect('/login');

  }
}

/*
===============================================================
MIDDLEWARE FUNCTION:
  middlewareFunctionName(req, res, next)

DESCRIPTION:
  Lorem

RETURNS:
  next() (Express Function)
===============================================================
*/
const middlewareFunctionName = () => {
  return 0;
}

module.exports = {
  findIndexById,
  verifyEntry,
  checkQuery,
  filterByName,
  filterByType,
  checkID,
  createError,
  validateEntry,
  authenticateUser,
  findByUsername,
  isAuthenticated
}