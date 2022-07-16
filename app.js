const fetch = require('node-fetch');
const moment = require('moment');
const {
  getData,
  isObjEmpty,
  isValidObject,
  groupBy,
  getCashInFees,
  getCashOutFeesJuridical
} = require('./utils');

const SERVER_URL = 'http://private-38e18c-uzduotis.apiary-mock.com/config/';

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

const commissionFees = async () => {
  try {
    const { data } = getData();
    const cashOutPercents = await fetch(`${SERVER_URL}cash-out/natural`).then((res) => res.json());
    const cashOutPercentsJuridical = await fetch(`${SERVER_URL}cash-out/juridical`).then((res) =>
      res.json()
    );
    const cashInPercents = await fetch(`${SERVER_URL}cash-in`).then((res) => res.json());

    // Sort data by date ascendingly
    const sortData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Data group by cash type (cash_in and cash_out)
    const grouped = groupBy(sortData, (fees) => fees.type);

    const cashInList = grouped.get('cash_in');
    const cashOutList = grouped.get('cash_out');

    // Calculate Cash In Fees
    cashInList.map((item) => {
      const errors = isValidObject(item);
      if (isObjEmpty(errors)) {
        // Calculate Cash in Commission Fees
        const {
          operation: { amount }
        } = item;
        const fees = getCashInFees(amount, cashInPercents);
        // console.log('PRINT IN %s=====>', 'cash in fees START ***', fees);
      }
      return null;
    });
    // console.log('PRINT IN %s=====>', 'cashInList START ***', cashInList);

    // Cash Out Data group by user type (cash_in and juridical)
    const cashOutrouped = groupBy(cashOutList, (fees) => fees.user_type);

    const naturalList = cashOutrouped.get('natural');
    const jurdicalList = cashOutrouped.get('juridical');

    // Calculate Cash Out Fees for Legal persons(juridical)
    jurdicalList.map((item) => {
      const errors = isValidObject(item);
      if (isObjEmpty(errors)) {
        // Calculate Cash out Commission Fees
        const {
          operation: { amount }
        } = item;
        const fees = getCashOutFeesJuridical(amount, cashOutPercentsJuridical);
        console.log('PRINT IN %s=====>', 'cash out fees(juridical) ***', fees);
      }
      return null;
    });
    // console.log('PRINT IN %s=====>', 'cashOutList naturalList ***', naturalList);
    console.log('PRINT IN %s=====>', 'cashOutList jurdicalList ***', jurdicalList);

    // const filterData = sortData
    //   .filter((item) => {
    //     // let date = new Date(item.date).getTime();
    //     // return date >= start && date <= end;
    //     return item.user_type === 'natural' && item.type === 'cash_out';
    //   })
    //   .map(v => ({...v, week_day: moment(v.date).startOf('isoWeek').format('YYYY-MM-DD')}))
    // .reduce((a, obj) => {
    //   const key = moment(obj.date).startOf('isoWeek').format('YYYY-MM-DD');
    //   a[key] = a[key] ? a[key] + obj.operation.amount : obj.operation.amount;
    //   console.log('PRINT IN %s=====>', 'date START ***', key);
    //   // return a + obj.operation.amount; }, {});
    //   return a;
    // }, {});
    // console.log('PRINT IN %s=====>', 'sortData START ***', filterData);
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
