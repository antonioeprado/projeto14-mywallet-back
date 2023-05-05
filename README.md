# About

This is MyWallet's backend. For more information about its frontend, please refer to [this link](https://github.com/antonioeprado/projeto14-mywallet-front/tree/main).
MyWallet has two routers:

## AuthRouter

### Endpoints

- POST sign-up:

  | Fields | Requirements |
  |--------|--------------|
  |name|A string with at least 2 characters|
  |email|An email-formatted string with allowed domains .com and .net|
  |password|A string that matches this regular expression "^[a-zA-Z0-9]{3,30}$"|
  |repassword|The same string typed in the password field|

- POST sign-in:

  | Fields | Requirements |
  |--------|--------------|
  |email|An email-formatted string with allowed domains .com and .net|
  |password|A string that matches this regular expression "^[a-zA-Z0-9]{3,30}$"|
  
  You'll receive a token after sign-in, that is used in the following routes.
  
## UsersRouter

### Endpoints

- GET expenses:
  *Authorization required!*
  Gets uses registered gains and expenses.

- POST expenses:
*Authorization required!*
  | Fields | Requirements |
  |--------|--------------|
  |value|The value to be registered|
  |description|A short description about the item|
  |type|A debit or credit|
  
- PUT expenses:
*Authorization required!*
  | Fields | Requirements |
  |--------|--------------|
  |value|The new value to be registered|
  |description|A new description about the item, if any|
  |item|The ID of the item to be updated|
  
- DELETE expenses:
*Authorization required!*
  | Fields | Requirements |
  |--------|--------------|
  |item|The ID of the item to be deleted|
  
