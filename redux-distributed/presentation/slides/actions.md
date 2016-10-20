### actions

Actions are messages that describe what your application is doing, and allow data to be sent through the system.

Actions are serializable. Plain Objects.

Example:

```js
const newUserAction = (user) => ({type: 'NEW_USER', user});
```

You can freely dispatch multiple additional actions from inside an action; these are known as __Action Creators.__

_Dispatched_ Actions pass through all __middleware__ then through all reducers.

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
