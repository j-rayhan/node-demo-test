const { isValidObject, getCashInFees, getCashOutFeesJuridical } = require('../utils');

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

describe('Input data(Commission Fees) tests', () => {
  // defour
  test('All fields is required', () => {
    const result = isValidObject({});
    const message = Object.values(result);
    expect(message.every((e) => e === 'is required')).toBeTruthy();
  });

  test('20222-23-23 Invalid date format', () => {
    // valid date format Y-M-D
    let _item = {...item, date: '20222-23-23'};
    const result = isValidObject(_item)
    // assert
    expect(result.date).toBe("invalid date format, must be Y-m-d");
  });

  test('User type, should be one of “natural”(natural person) or “juridical”(legal person)', () => {
    let result = isValidObject(item);
    expect(result).toStrictEqual({});
    let _item = {...item, user_type: 'juridical'};
    result = isValidObject(_item);
    // console.log('sdfad----->', result)
    expect(result).toStrictEqual({});
    // Invalid user type
    _item = {...item, user_type: 'ajuridical'};
    result = isValidObject(_item);
    expect(result.user_type).toBe("invalid user type, must be one of natural, juridical");
  });

  test('Division of 2 numbers', () => {
    // arrange and act
    const result = 3;

    // assert
    expect(result).toBe(3);
  });
});
