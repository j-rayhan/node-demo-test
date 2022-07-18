const fetch = require('node-fetch');
const moment = require('moment');
const {
  SERVER_URL,
  getData,
  isObjEmpty,
  isValidObject,
  groupBy,
  getCashInFees,
  getCashOutFeesJuridical
} = require('./utils');

const commissionFees = async () => {
  try {
    const { data } = getData();
    const cashOutPercents = await fetch(`${SERVER_URL}cash-out/natural`).then((res) => res.json());
    const cashOutPercentsJuridical = await fetch(`${SERVER_URL}cash-out/juridical`).then((res) =>
      res.json()
    );
    const cashInPercents = await fetch(`${SERVER_URL}cash-in`).then((res) => res.json());

    // Sort data by date ascending
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
        console.log('PRINT IN %s===========>', 'cash in fees START ***', fees);
      }
      return null;
    });
    // console.log('PRINT IN %s=====>', 'cashInList START ***', cashInList);

    // Cash Out Data group by user type (cash_in and juridical)
    const cashOutGrouped = groupBy(cashOutList, (fees) => fees.user_type);

    const naturalList = cashOutGrouped.get('natural');
    const juridicalList = cashOutGrouped.get('juridical');

    // Calculate Cash Out Fees for Legal persons(juridical)
    juridicalList.map((item) => {
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
    // console.log('PRINT IN %s=====>', 'cashOutList jurdicalList ***', juridicalList);

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
