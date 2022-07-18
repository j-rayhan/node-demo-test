const fetch = require('node-fetch');

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

    // Cash Out Data group by user type (cash_in and juridical)
    const cashOutGrouped = groupBy(cashOutList, (fees) => fees.user_type);

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
  } catch (error) {
    console.log('PRINT IN %s=====>', 'ERROR *** ***', error);
  }
};
commissionFees();
