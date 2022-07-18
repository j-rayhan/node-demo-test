[TODO](https://gist.github.com/mariusbalcytis/9d8d2122fe005bd2c4e10720834bfe25)
============

Project Structure
-----------------
 * this project made in JavaScript(ES5 or ES6) using node.js;
 * third party libraries, (moment, node-fetch);
 * code flow [Airbnb style guide](https://github.com/airbnb/javascript) compatible by using [ESLint](https://eslint.org/);
 


Node Library Dependencies
-------------------------

The dependencies for this application should be downloaded using the
``npm`` command-line tool. You can get this tool by `downloading Node.js
<https://nodejs.org/en/download/>`_. Make sure to choose the correct option for
your operating system.

Once the installation is complete, you may need to restart your computer before
using the command line tools. You can test that it's installed by running the
following command:

```
  node -v
```


This should print out the version of ``node`` you currently have - we recommend
using the latest Long Term Support version, currently 10.16.3, so this command should print something like
``v16.10.0``.

Once ``npm`` is installed, you can install this application dependencies by running the
following command from the **node-demo-test** directory:

```
  npm install
```

You must run this from the top level of the project, so ``npm`` has access to
the **package.json** file where the dependencies are.

Although, it is completely harmless and you can start the application by running.

```
  npm start input.json
```
Example output result to stdout
============
```
➜  cat input.json
[
    { "date": "2016-01-05", "user_id": 1, "user_type": "natural", "type": "cash_in", "operation": { "amount": 200.00, "currency": "EUR" } },
    { "date": "2016-01-06", "user_id": 2, "user_type": "juridical", "type": "cash_out", "operation": { "amount": 300.00, "currency": "EUR" } },
    { "date": "2016-01-06", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 30000, "currency": "EUR" } },
     { "date": "2016-01-07", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 1000.00, "currency": "EUR" } },
    { "date": "2016-01-07", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 100.00, "currency": "EUR" } },
    { "date": "2016-01-10", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 100.00, "currency": "EUR" } },
    { "date": "2016-01-10", "user_id": 2, "user_type": "juridical", "type": "cash_in", "operation": { "amount": 1000000.00, "currency": "EUR" } },
    { "date": "2016-01-10", "user_id": 3, "user_type": "natural", "type": "cash_out", "operation": { "amount": 1000.00, "currency": "EUR" } },
    { "date": "2016-02-15", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 300.00, "currency": "EUR" } },
]

➜  node start input.json

PRINT IN cash in fees START ***===========> 0.06
PRINT IN cash in fees START ***===========> 5
...
PRINT IN cash out fees(juridical) ***=====> 0.9
...
```


Running the Unit Tests
----------------------

To run the unit tests for this app, I used `Jest
<https://jestjs.io/docs/en/getting-started>`_. Jest has been included in this
project's dependencies, so ``npm install`` should install everything.

This app contains a module of unit tests that you can call individually
with ``npm test``. For example, to run the test **app.test.js**,
run the command:

```
  npm test app.test.js
```

stdout:
```
 PASS  tests/app.test.js
  Input data tests
    ✓ All fields is required (1 ms)
    ✓ 20222-23-23 Invalid date format
    ✓ User type, should be one of “natural”(natural person) or “juridical”(legal person)
    ✓ Cash type, should be one of “cash_in” or “cash_out”
    ✓ Currency should be EUR (1 ms)
    ✓ Amount should be greater then 0
  Commission Fees tests
    ✓ 0.023 EUR should be rounded to 0.03 Euro (1 ms)
    ✓ Cash IN Commission fee should be 0.03% from total amount
    ✓ Cash IN Commission fee should not more than 5.00 EUR
    ✓ Cash Out(Legal persons) Commission fee should be 0.03% from total amount
    ✓ Cash Out(Legal persons) Commission fee should not less than 0.50 EUR (1 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
...
```

## Input data
Input data is given in JSON file. Performed operations are given in that file. In each object following data is provided:
```js
{
    "date": "2016-01-05", // operation date in format `Y-m-d`
    "user_id": 1, // user id, integer
    "user_type": "natural", // user type, one of “natural”(natural person) or “juridical”(legal person)
    "type": "cash_in", // operation type, one of “cash_in” or “cash_out”
    "operation": {
        "amount": 200, // operation amount(for example `2.12` or `3`)
        "currency": "EUR" // operation currency `EUR`
    }
}
```
