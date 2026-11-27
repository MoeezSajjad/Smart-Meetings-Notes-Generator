import React, { createContext, useContext, useEffect, useState } from "react";
import { configured, getClient } from "../firebase";

const Context = createContext(null);
export const useSession = () => useContext(Context);

export function SessionProvider({ children }) {
  const [state, setState] = useState({
    loading: configured,
    user: null,
    unavailable: !configured,
  });
  useEffect(() => {
    if (!configured) return;
    let active = true;
    let unsubscribe;
    const failed = () =>
      active && setState({ loading: false, user: null, unavailable: true });
    getClient()
      .then(({ auth, sdk }) => {
        if (!active) return;
        unsubscribe = sdk.onAuthStateChanged(
          auth,
          (user) => {
            if (active) setState({ loading: false, user, unavailable: false });
          },
          failed,
        );
      })
      .catch(failed);
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
