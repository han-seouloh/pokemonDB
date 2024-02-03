const { ReturnCodes } = require('./returnCodes');
const userDB = require('./db/users.json');
const bcrypt = require('bcrypt');
const {logger} = require('./loggerConfig');

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
  "Water",
  "Test"
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
  const ReturnCodesArray = [];

  if (entry.id && entry.name && entry.type && entry.description) {
    ReturnCodesArray.push(ReturnCodes.SUCCESS);
  } else {
    ReturnCodesArray.push(ReturnCodes.ERROR);
  };
  ReturnCodesArray.push(idCheck(entry));
  ReturnCodesArray.push(nameCheck(entry));
  ReturnCodesArray.push(descriptionCheck(entry));
  ReturnCodesArray.push(typeArrayCheck(entry));

  for (const retCode of ReturnCodesArray) {
    if (retCode !== ReturnCodes.SUCCESS) return retCode;
  }

  return ReturnCodes.SUCCESS;
}

/*
===============================================================
FUNCTION:
  idCheck(entry object)

DESCRIPTION:
  Checks for id validity

RETURNS:
  ReturnCodes (Integer)
===============================================================
*/
const idCheck = (entry) => {
  if (typeof entry.id === 'number') {
    if (entry.id <= 0) return ReturnCodes.INVALID_ID;
    
    return ReturnCodes.SUCCESS;
  };
  return ReturnCodes.NOT_A_NUMBER;
}

/*
===============================================================
FUNCTION:
  nameCheck(entry object)

DESCRIPTION:
  Checks for name validity

RETURNS:
  ReturnCodes (Integer)
===============================================================
*/
const nameCheck = (entry) => {
  if (typeof entry.name === 'string') return ReturnCodes.SUCCESS;
  return ReturnCodes.NOT_A_STRING;
}

/*
===============================================================
FUNCTION:
  descriptionCheck(entry object)

DESCRIPTION:
  Checks for description's validity

RETURNS:
  ReturnCodes (Integer)
===============================================================
*/
const descriptionCheck = (entry) => {
  if (typeof entry.description === 'string') return ReturnCodes.SUCCESS;
  return ReturnCodes.NOT_A_STRING;
}

/*
===============================================================
FUNCTION:
  typeArrayCheck(entry object)

DESCRIPTION:
  Checks new entry's type array for validity.

RETURNS:
  ReturnCode (Integer)
===============================================================
*/
const typeArrayCheck = (entry) => {
  if (entry.type instanceof Array) {
    for (const type of entry.type) {
      if (typeof type !== 'string') return ReturnCodes.NOT_A_STRING;
      if(validType(type) === ReturnCodes.INVALID_POKEMON_TYPE) return ReturnCodes.INVALID_POKEMON_TYPE;
    }
    return ReturnCodes.SUCCESS;

  }
  return ReturnCodes.NOT_AN_ARRAY;
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
  ReturnCode (Integer)
===============================================================
*/
const validType = (type) => {
  if (typesList.has(capitalize(type))) {
    return ReturnCodes.SUCCESS;
  }
  return ReturnCodes.INVALID_POKEMON_TYPE;
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
  checkOriginalID(id)

DESCRIPTION:
  Receives an id and verifies it's not part of the original 151 entries.

RETURNS:
  ReturnCode (Integer)
===============================================================
*/
const checkOriginalID = (id) => {
  if (id < 152) {
    return ReturnCodes.ORIGINAL_ID;
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
const createError = (status=500, message) => {
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
  let err = createError(404, `User with username:${username} does not exist.`);

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
const authenticateUser = async (username, password, callback) => {
  const user = userDB.find(user => user.username === username);

  let retCode = ReturnCodes.ERROR;
  let err = createError(400, 'Unknown error...');

  if (user) {
    if (await comparePwd(password, user)) {
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
  createUser(user)

DESCRIPTION:
  Receives user data and if valid, adds to user DB.

RETURNS:
  User/Error (Object)
===============================================================
*/
const createUser = (user) => {
  return new Promise(async (resolve, reject) => {
    const exists = userDB.findIndex(entry => entry.username === user.username);

    if (exists === -1) {
      try {
        user.password = await hashPwd(user.password);
      } catch (err) {
        return reject(err);
      }

      userDB.push(user);
      resolve(user);

    } else {
      const err = createError(400, 'Username already exists.');
      reject(err);

    }
  });
};

/*
===============================================================
FUNCTION:
  hashPwd(password, saltRound)

DESCRIPTION:
  Accepts password and saltRound and returns hashed password.

RETURNS:
  hashedPassword (String)
===============================================================
*/
const hashPwd = async (password) => {
  try {
    const saltRound = Math.floor(Math.random()*10 + 10);
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (err) {
    logger.error('An error occurred while hashing password.');
    
    return err;
  }
}

/*
===============================================================
FUNCTION:
  comparePwd(password, user)

DESCRIPTION:
  Compares inputted password to password stored in user.

RETURNS:
  (Boolean)
===============================================================
*/
const comparePwd = async (password, user) => {
  const matched = await bcrypt.compare(password, user.password);
  if (matched) return matched;

  return false;
}

/*
===============================================================
FUNCTION:
  initializeAdmin(username, password)

DESCRIPTION:
  Register admin user during server initialization ..

RETURNS:
  Void
===============================================================
*/
const initializeAdmin = async(username, password) => {
  try {
    await createUser({username, password});

  } catch (err) {
    logger.error(err);
  
  };
}

/*
===============================================================
FUNCTION:
  runAsyncFunctions(fnArray {fn, params})

DESCRIPTION:
  Receives an array with objects containing an async function and 
  its parameters and runs them.

RETURNS:
  Void
===============================================================
*/
const runAsyncFunctions = async( fnArray ) => {
  for (const entry of fnArray) {
    await entry.fn(...entry.params);
  };
};

/*
===============================================================
FUNCTION:
  runSyncFunctions(fnArray {fn, params})

DESCRIPTION:
  Receives an array with objects containing a sync function and 
  its parameters and runs them.

RETURNS:
  Void
===============================================================
*/
const runSyncFunctions = ( fnArray ) => {
  for (const entry of fnArray) {
    entry.fn(...entry.params);
  };
};

/*
===============================================================
FUNCTION:
  isDuplicateEntry(entry object, data)

DESCRIPTION:
  Receives an entry and checks if it's a duplicate entry

RETURNS:
  (Boolean)
===============================================================
*/
const isDuplicateEntry = (entry, data) => {
  const filteredEntries = data.filter(pokemon => pokemon.id === entry.id || pokemon.name === entry.name);

  if (filteredEntries.length > 0) return true;

  return false;
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
      err = createError(400, 'Missing entry properties.');
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
    
    case ReturnCodes.INVALID_ID:
      err = createError(400, 'Invalid id.');
      return next(err);
    
    case ReturnCodes.INVALID_POKEMON_TYPE:
      err = createError(400, 'Invalid Pokemon type.');
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
  const nonSecurePaths = ['/login', '/register', '/test/login'];
  if (nonSecurePaths.includes(req.path)) {
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
  checkQuery,
  validType,
  filterByName,
  filterByType,
  checkOriginalID,
  createError,
  validateEntry,
  authenticateUser,
  findByUsername,
  isAuthenticated,
  createUser,
  initializeAdmin,
  runAsyncFunctions,
  runSyncFunctions,
  isDuplicateEntry
}