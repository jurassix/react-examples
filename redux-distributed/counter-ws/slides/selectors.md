### Selectors via Reselect

https://github.com/reactjs/reselect

Selectors provide React Components memoized access to state. The more fine grained you make your selectors the better your performance can be.

Selectors allow us to shape our state into exactly what our Components need. All transforming is done upfront, as simple easily tested functions.

Example:

#### Selectors compose together for performance

Redux _connects_ components to actions and state. If the state reference has changed the connected componenet will render. Connected Components are called __Containers.__

```js
const selectUsers = (state) => state.users || [];
const selectCompanies = (state) => state.companies || [];

const selectUsersWithCompanies = createSelector(
  selectUsers,
  selectCompanies,
  (users, companies) => {
    users.map((user) => {
      const company = companies.find((company) => company.id === user.companyId);
      return {
        ...user,
        company,
      };
    });
  }
);
```

Example:

#### State

```js
const state = {
  users: [
    {
      id: '1',
      firstName: 'lucy',
      lastName: 'blaha',
      birthDate: '10/19/2013',
      profileUrl: '/45A2R5.png',
    },
    {
      id: '2',
      firstName: 'amelia',
      lastName: 'blaha',
      birthDate: '10/29/2015',
      profileUrl: '/R90H35.png',
    }
  ],
}
```

#### Selector

```js
const selectUsers = (state) => state.users || [];
```

#### Component

```js
const getAgeInYears = (birthDate) =>
  (new Date()).getFullYear() - (new Date(birthDate)).getFullYear();

const User = ({user}) => (
  <div className="user">
    <div className="user-profile-pic">
      <img src={user.profileUrl} alt="User Profile Picture">
    </div>
    <div className="user-username">
      Username: {`${user.lastName}, ${user.firstName}`}
    </div>
    <div className="user-age">
      Age: {getAgeInYears(user.birthDate)}
    </div>
  </div>
);
```

This is a straw man example. But in my experience it's very representative of actual code you would right or review.

What's the problem here?

Our state is simple, our selector is simple, however, our component is forced to handle the business logic of transforming data into it's presentational form.

This last part is critical... _Think about data in it's Presentational form._ You should try to make your Components should be the dumbest part of application.

#### Single Responsibility Principal

Components should be functions of their properties and nothing more.

Selectors are responsible for transforming state into presentational forms.

Establishing good patterns is crucial to efficient code reviews. If the reviewer knows where to expect the Business Logic to be but sees somewhere else, a natural conversation happens.

### Refactor


#### Selector

```js
const getAgeInYears = (birthDate) =>
  (new Date()).getFullYear() - (new Date(birthDate)).getFullYear();

const selectUsers = (state) => state.users || [];
const selectProfileUsers = createSelector(
  selectUsers,
  (users) => {
    users.map((user) => ({
      profileUrl: user.profileUrl,
      username: `${user.lastName}, ${user.firstName}`,
      age: getAgeInYears(user.birthDate)
    }));
  }
);
```

#### Component

```js
const User = ({user}) => (
  <div className="user">
    <div className="user-profile-pic">
      <img src={user.profileUrl} alt="User Profile Picture">
    </div>
    <div className="user-username">
      Username: {user.username}
    </div>
    <div className="user-age">
      Age: {user.age}
    </div>
  </div>
);
```
