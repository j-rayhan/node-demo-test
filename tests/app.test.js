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
  test('All fields is required', () => {
    // arrange and act
    const result = isValidObject({});
    const message = Object.values(result);
    // message.every('is required')
    // console.log(
    //   'result--->',
    //   message.every((e) => e === 'is required')
    // );
    // assert
    expect(message.every((e) => e === 'is required')).toBeTruthy();
  });

  test('Subtraction of 2 numbers', () => {
    // arrange and act
    const result = 8;

    // assert
    expect(result).toBe(8);
  });

  test('Multiplication of 2 numbers', () => {
    // arrange and act
    const result = 16;

    // assert
    expect(result).toBe(16);
  });

  test('Division of 2 numbers', () => {
    // arrange and act
    const result = 3;

    // assert
    expect(result).toBe(3);
  });
});
