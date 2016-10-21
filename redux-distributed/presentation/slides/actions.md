### actions

Actions describe what is happening in your application, and allow data to be
introduced into the system.

 - Actions are _functions_ that return _serializable_ JSON objects.
 - Actions should follow the convention of having a `type` field that _describes_
the users intent.

Example:

```js
const newUserAction = (user) => ({ type: 'NEW_USER', user });
```

You can freely dispatch many _actions_ from inside an action; these are known as __Action Creators.__

```js
const saveUserAction = (userId) = async (store, action) => {
  const {users} = store.getState();
  const user = users.find((user) => user.id === userId);
  try {
    store.dispatch({type: 'SAVING_USER', userId});
    const response = await fetch('/user', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (response.status === 200) {
      store.dispatch({TYPE: 'USER_SAVE_SUCCESSFUL', userId});
    }
  } catch (e) {
    store.dispatch({TYPE: 'USER_SAVE_FAILED', userId});
  }
};
```

_Dispatched_ Actions pass through all __middleware__ then through all reducers.
