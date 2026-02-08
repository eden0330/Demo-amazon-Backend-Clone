import { useContext, useEffect, useReducer } from "react";
import "./App.css";

import Routing from "./Routing.jsx";
import { DataContext } from "./components/DataProvider/DataProvider.jsx";
import { Type } from "./Utility/action.type.js";
import { auth } from "./Utility/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [{ user }, dispatch] = useContext(DataContext);

  useEffect(() => {
    // const unsub = onAuthStateChanged(auth, (authUser) => {
    //       console.log(authUser);
 const unsub = onAuthStateChanged(auth, (authUser) => {
   dispatch({ type: Type.SET_USER, user: authUser || null });
 });
    // auth.onAuthStateChanged((authUser) => {
    //   if (authUser) {
    //     // console.log(authUser);
    //     dispatch({ type: Type.SET_USER, user: authUser });
    //   } else {
    //     dispatch({ type: Type.SET_USER, user: null });
    //   }
    // });
    return () => unsub();
  }, [dispatch]);
  return (
    <>
      <Routing />
    </>
  );
}

export default App;
