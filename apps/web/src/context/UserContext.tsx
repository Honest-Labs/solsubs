import { useWallet } from "@solana/wallet-adapter-react";
import { User, getAuth } from "firebase/auth";
import {
  FC,
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

export interface UserContextT {
  user: User | null;
}

export const UserContext = createContext({} as UserContextT);

export const UserContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { disconnecting } = useWallet();
  const [user, setUser] = useState<User | null>(getAuth().currentUser);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      console.log(u);
      setUser(u);
      setLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (disconnecting && user) {
      (async () => {
        console.log("disconnecting wallet, removing user");
        setUser(null);
        await getAuth().signOut();
      })();
    }
  }, [disconnecting]);

  if (!loaded) return <></>;

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};
