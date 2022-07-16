const { readFileSync } = require('fs');

const isObjEmpty = (obj) => Object.keys(obj).length === 0;

const isDate = (dateString) => {
  // Parse the date parts to integers
  const parts = dateString.split('-');
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};
const isValidDate = (date) => {
  if (!date) {
    return 'is required';
  }
  // First check for the format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'invalid date format, must be Y-m-d';
  }
  if (!isDate(date)) {
    return 'invalid date';
  }
  return '';
};
const isValidUserId = (user_id) => {
  if (!user_id) {
    return 'is required';
  }
  if (user_id < 1) {
    return 'invalid user_id';
  }
  return '';
};
const isValidUserType = (userType) => {
  if (!userType) {
    return 'is required';
  }
  if (!['natural', 'juridical'].includes(userType)) {
    return 'invalid user type, must be one of natural, juridical ';
  }
  return '';
};
const isValidType = (type) => {
  if (!type) {
    return 'is required';
  }
  if (!['cash_in', 'cash_out'].includes(type)) {
    return 'invalid type, must be one of cash_in, cash_out';
  }
  return '';
};
const isValidOperation = (operation) => {
  if (!operation) {
    return 'is required';
  }
  if (!operation.amount || operation.amount < 0) {
    return 'invalid amount, must be greater then 0';
  }
  if (!operation.currency || operation.currency !== 'EUR') {
    return 'invalid currency, must be EUR';
  }
  return '';
};

const isValidObject = (item = {}) => {
  const { date, user_id, user_type, type, operation } = item;
  const error = {};
  if (isValidDate(date).length) error.date = isValidDate(date);
  if (isValidUserId(user_id).length) error.user_id = isValidUserId(user_id);
  if (isValidUserType(user_type).length) error.user_type = isValidUserType(user_type);
  if (isValidType(type).length) error.type = isValidType(type);
  if (isValidOperation(operation).length) error.operation = isValidOperation(operation);

  return error;
};

// Read file data
const getData = () => {
  try {
    const data = readFileSync(`./${process.argv[2]}`);
    // console.log(JSON.parse(data));
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found!');
    } else {
      throw error;
    }
  }
  return {};
};

class Fees {
  constructor(cashAmount, percents, maxAmount, isLegal) {
    this.fees = 0.0;
    this.amount = cashAmount;
    this.percents = percents;
    this.max = maxAmount;
    this.isLegal = isLegal;
  }

  getPercent() {
    const currentFees = parseFloat((this.amount * this.percents) / 100).toFixed(2);
    if (currentFees > this.max) this.fees = this.max.toFixed(2);
    // if (this.isLegal && currentFees < this.max) this.fees = this.max.toFixed(2)
    else this.fees = currentFees;
    return this.fees;
  }
}

function roundUp(num, precision = 2) {
  // 0.023 --> 0.03
  const precisionValue = 10 ** precision;
  return Math.ceil(num * precisionValue) / precisionValue;
}

// export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

const getCashInFees = (cashInAmount, data) => {
  const {
    percents,
    max: { amount }
  } = data;
  // const fees = new Fees(cashInAmount, percents, amount, false);
  // return fees.getPercent();
  let fees = 0.0;
  const currentFees = parseFloat((cashInAmount * percents) / 100);
  if (currentFees > amount) fees = amount;
  else fees = currentFees;
  return roundUp(fees);
};

const getCashOutFeesJuridical = (cashOutAmount, data) => {
  const {
    percents,
    min: { amount }
  } = data;
  let fees = 0.0;
  const currentFees = parseFloat((cashOutAmount * percents) / 100);
  if (currentFees < amount) fees = amount;
  else fees = currentFees;
  return roundUp(fees);
};

module.exports = {
  getData,
  roundUp,
  groupBy,
  isValidObject,
  isObjEmpty,
  getCashInFees,
  getCashOutFeesJuridical
};
