import { createContext } from "react";
import { System } from "./model/system";

// Use React context to make your store available in your application
export const StoreContext = createContext({} as System);
export const StoreProvider = StoreContext.Provider;