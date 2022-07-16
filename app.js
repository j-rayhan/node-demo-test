const { readFileSync } = require('fs');
const fetch = require('node-fetch');
const moment = require('moment');

const SERVER_URL = 'http://private-38e18c-uzduotis.apiary-mock.com/config/';

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
  if (!/^\d{4}\-\d{2}\-\d{2}$/.test(date)) {
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
const getCashInFees = (cashInAmount, data) => {
  const {
    percents,
    max: { amount }
  } = data;
  // const fees = new Fees(cashInAmount, percents, amount, false);
  // return fees.getPercent();
  let fees = 0.0;
  const currentFees = parseFloat((cashInAmount * percents) / 100).toFixed(2);
  if (currentFees > amount) fees = amount.toFixed(2);
  else fees = currentFees;
  return fees;
};
const getCashOutFees = (cashOutAmount, data) => {
  // Get cash in percents, and max percents amount from api
  const {
    percents,
    week_limit: { amount }
  } = data;
  // const fees = new Fees(cashOutAmount, percents, amount, false);
  // return fees.getPercent();
  let fees = 0.0;
  const currentFees = parseFloat((cashOutAmount * percents) / 100).toFixed(2);
  if (currentFees > amount) fees = amount.toFixed(2);
  else fees = currentFees;
  return fees;
};

const getCashOutFeesJuridical = (cashOutAmount, data) => {
  const {
    percents,
    min: { amount }
  } = data;
  // const fees = new Fees(cashOutAmount, percents, amount, true);
  // return fees.getPercent();
  let fees = 0.0;
  const currentFees = parseFloat((cashOutAmount * percents) / 100).toFixed(2);
  if (currentFees < amount) fees = amount.toFixed(2);
  else fees = currentFees;
  return fees;
};
const commissionFees = async () => {
  try {
    const { data } = getData();
    const cashOutPercents = await fetch(`${SERVER_URL}cash-out/natural`).then((res) => res.json());
    const cashOutPercentsJuridical = await fetch(`${SERVER_URL}cash-out/juridical`).then((res) =>
      res.json()
    );
    const cashInPercents = await fetch(`${SERVER_URL}cash-in`).then((res) => res.json());
    // Sort data by date ascendingly
    const sortData = data.sort(function(a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    // filter data by weekly
    const start =  new Date('2022-07-01').getTime()
    const end=new Date('2022-07-13')
    end.setHours(23,59,59,999)
    end.getTime()

    const filterData = sortData.filter(item => {
      // let date = new Date(item.date).getTime();
      // return date >= start && date <= end;
      return item.user_type === 'natural' && item.type === 'cash_out'
    }).reduce(function (a, obj) { 
      const key = moment(obj.date).startOf("isoWeek").format('YYYY-MM-DD')
      a[key] = a[key]? a[key]+obj.operation.amount : obj.operation.amount
      console.log('PRINT IN %s=====>', 'date START ***', key);
      // return a + obj.operation.amount; }, {});
      return a
    }, {});
    console.log('PRINT IN %s=====>', 'sortData START ***', filterData);
    // data?.map((item) => {
    //   const errors = isValidObject(item);
    //   if (isObjEmpty(errors)) {
    //     // Calculate Cash in Commission Fees
    //     const {
    //       type,
    //       user_type,
    //       operation: { amount }
    //     } = item;
    //     const fees =
    //       type === 'cash_in'
    //         ? getCashInFees(amount, cashInPercents)
    //         : user_type === 'juridical'
    //         ? getCashOutFeesJuridical(amount, cashOutPercentsJuridical)
    //         : getCashOutFees(amount, cashOutPercents);
    //     console.log('PRINT IN %s=====>', 'cash in fees START ***', fees);
    //   }
    // });
  } catch (error) {
    console.log('PRINT IN %s=====>', 'ERROR *** ***', error);
  }
};
commissionFees();

// const x = 100;

// const json_data = require(`./${process.argv[2]}`);

// console.log(x);

// console.log(process.argv[2]);
// console.log(
//   'file data', json_data
// )
// const test = (a, b) => {
//     return a + b;
// };
