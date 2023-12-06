const ReturnCodes = {
  // GENERAL RETURN CODES
  SUCCESS: 0,
  GENERAL_FAILURE: 1,

  // REQ. BODY CODES
  NOT_A_NUMBER: 10,
  NOT_A_STRING: 11,
  NOT_AN_ARRAY: 12,

  // REQ. QUERY CODEs
  Q_INVALID: 20,
  Q_EMPTY: 21,
  Q_NAME: 22,
  Q_TYPE: 23,
}

module.exports = {
  ReturnCodes
}