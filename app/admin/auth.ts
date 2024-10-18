import { DefaultAuthProvider } from 'adminjs'

import componentLoader from './component_loader.js'
import { DEFAULT_ADMIN } from "./constants.js"

/**
 * Your "authenticate" function. Depending on the auth provider used, the payload may be different.
 *
 * The default authentication provider uses email and password to authenticate. You can modify this
 * function to use email & password to verify if the User exists and if their passwords match.
 *
 * The default implementation below will let any in, so make sure to update it.
 */

const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    if (email === DEFAULT_ADMIN.email) {
      console.log(password)
      return { email };
    }

    return null;
  },
});

export default provider;
