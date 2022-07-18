const fetch = require('node-fetch');
const {
  SERVER_URL,
  isValidObject,
  roundUp,
  getCashInFees,
  getCashOutFeesJuridical
} = require('../utils');

const item = {
  date: '2016-01-05', // operation date in format `Y-m-d`
  user_id: 1, // user id, integer
  user_type: 'natural', // user type, one of “natural”(natural person) or “juridical”(legal person)
  type: 'cash_in', // operation type, one of “cash_in” or “cash_out”
  operation: {
    amount: 200, // operation amount(for example `2.12` or `3`)
    currency: 'EUR' // operation currency `EUR`
  }
};

describe('Input data tests', () => {
  test('All fields is required', () => {
    const result = isValidObject({});
    const message = Object.values(result);
    expect(message.every((e) => e === 'is required')).toBeTruthy();
  });

  test('20222-23-23 Invalid date format', () => {
    // valid date format Y-M-D
    let _item = { ...item, date: '20222-23-23' };
    const result = isValidObject(_item);
    // assert
    expect(result.date).toBe('invalid date format, must be Y-m-d');
  });

  test('User type, should be one of “natural”(natural person) or “juridical”(legal person)', () => {
    let result = isValidObject(item);
    expect(result).toStrictEqual({});
    let _item = { ...item, user_type: 'juridical' };
    result = isValidObject(_item);
    // console.log('sdfad----->', result)
    expect(result).toStrictEqual({});
    // Invalid user type
    _item = { ...item, user_type: 'ajuridical' };
    result = isValidObject(_item);
    expect(result.user_type).toBe('invalid user type, must be one of natural, juridical');
  });

  test('Cash type, should be one of “cash_in” or “cash_out”', () => {
    let result = isValidObject(item);
    expect(result).toStrictEqual({});
    let _item = { ...item, type: 'cash_out' };
    result = isValidObject(_item);
    // console.log('sdfad----->', result)
    expect(result).toStrictEqual({});
    // Invalid user type
    _item = { ...item, type: 'cash_out_' };
    result = isValidObject(_item);
    expect(result.type).toBe('invalid type, must be one of cash_in, cash_out');
  });

  test('Currency should be EUR', () => {
    let result = isValidObject(item);
    expect(result).toStrictEqual({});
    let _item = { ...item, operation: { currency: 'USD', amount: 250 } };
    result = isValidObject(_item);
    expect(result.operation).toBe('invalid currency, must be EUR');
  });

  test('Amount should be greater then 0', () => {
    let result = isValidObject(item);
    expect(result).toStrictEqual({});
    let _item = { ...item, operation: { currency: 'USD', amount: -250 } };
    result = isValidObject(_item);
    expect(result.operation).toBe('invalid amount, must be greater then 0');
  });
});

describe('Commission Fees tests', () => {
  let cashOutPercentsJuridical = {};
  let cashInPercents = {};
  beforeAll(async () => {
    cashOutPercentsJuridical = await fetch(`${SERVER_URL}cash-out/juridical`).then((res) =>
      res.json()
    );
    cashInPercents = await fetch(`${SERVER_URL}cash-in`).then((res) => res.json());
  });

  test('0.023 EUR should be rounded to 0.03 Euro', () => {
    const fees = roundUp(0.023);
    expect(fees).toBe(0.03);
  });

  test('Cash IN Commission fee should be 0.03% from total amount', () => {
    const {
      operation: { amount }
    } = item;
    const fees = getCashInFees(amount, cashInPercents);
    expect(fees).toBe(0.06);
  });

  test('Cash IN Commission fee should not more than 5.00 EUR', () => {
    let _item = { ...item, operation: { currency: 'EUR', amount: 50050 } };
    const {
      operation: { amount }
    } = _item;
    const fees = getCashInFees(amount, cashInPercents);
    expect(fees).toBe(5.0);
  });

  test('Cash Out(Legal persons) Commission fee should be 0.03% from total amount', () => {
    let _item = { ...item, type: 'cash_out', operation: { currency: 'EUR', amount: 5050 } };
    const {
      operation: { amount }
    } = _item;
    const fees = getCashOutFeesJuridical(amount, cashOutPercentsJuridical);
    expect(fees).toBe(15.15);
  });

  test('Cash Out(Legal persons) Commission fee should not less than 0.50 EUR', () => {
    let _item = { ...item, type: 'cash_out', operation: { currency: 'EUR', amount: 150 } };
    const {
      operation: { amount }
    } = _item;
    const fees = getCashOutFeesJuridical(amount, cashOutPercentsJuridical);
    expect(fees).toBe(0.5);
  });
});
