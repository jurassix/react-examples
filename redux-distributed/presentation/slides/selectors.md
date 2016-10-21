### Selectors _via Reselect_

https://github.com/reactjs/reselect

Selectors are a key abstraction in Redux.

The Reselected state structure matches your __Presentational Layer.__

Selectors are _memoized_ functions.

 - Memoized simply means return a cached result for know inputs to a function: `f(x) = y`.
 - A simple hash map data structure can be introduced to remember previous parameters and simply return the previous computed result.

Selectors provide React Components memoized access to state.

 - The more fine grained you make your selectors the better your performance can be.
 - Selectors allow us to shape our state into exactly what our Components need.
 - All transforming is done upfront, as simple easily tested functions.


_Selectors compose together for performance._

 - Redux _connects_ components to actions and state.
 - If the state reference has changed the connected componenet will render.
 - Connected Components are called __Containers.__

#### Example

```js
const selectSystemRoles = (state) => state.auth.roles || [];
const selectSystemPermissions = (state) => state.auth.permissions || [];
const selectUsers = (state) => state.users || [];
const selectActiveUserId = (state) => state.activeUserId;
const selectActiveUser = createSelector(
  selectUsers,
  selectActiveUserId,
  (users, userId) => users.find((user) => user.id === userId) || {}
);
const selectActiveUserRoleIds = createSelector(
  selectActiveUser,
  (user) => user.roleIds
);
const selectActiveUserPermissionIds = createSelector(
  selectActiveUser,
  (user) => user.permissionIds
);
const selectActiveUserRoles = createSelector(
  selectSystemRoles,
  selectActiveUserRoleIds,
  (roles, userRoleIds) =>
    roles.filter((role) => userRoleIds.indexOf(role.id) !== -1)
);
const selectActiveUserPermissions = createSelector(
  selectSystemPermissions,
  selectActiveUserPermissionsIds,
  (permissions, userPermissionIds) =>
    permissions.filter((perm) => userPermissionIds.indexOf(perm.id) !== -1)
);
```

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

__What's the problem here?__

Our state is simple, our selector is simple, however, our component is forced to handle the business logic of transforming data into it's __presentational form__.

_We need to think about data in it's Presentational form._

You should try to make your Components should be the _dumbest_ part of the application.

#### Single Responsibility Principal

 - Components should be functions of their properties and nothing more.
  - `f(x) = y`
 - Selectors are responsible for transforming state into presentational forms.
 - Establishing good patterns is crucial to efficient code reviews.
  - If the reviewer knows where to expect the Business Logic to be but sees somewhere else, a natural conversation happens.

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
