import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/*Since we will be using useSelector and useDispatch hooks many times in our project, 
create custom typed hooks for dispatching actions and selecting data from the Redux store*/

// 📐 Types: create typed versions of the useDispatch and useSelector hooks.
// This helps avoid potential circular import dependency issues and makes it easier to use these hooks across the application.

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
