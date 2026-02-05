import React, { useState, useContext } from "react";
import styles from "./Auth.module.css";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { Type } from "../../Utility/action.type";
import { auth } from "../../Utility/Firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { DataContext } from "../../components/DataProvider/DataProvider";
import { ClipLoader } from "react-spinners";

const Auth = () => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState({ signIn: false, signUp: false });
  const [{ user }, dispatch] = useContext(DataContext);

  const navigate = useNavigate();
  const navStateData = useLocation();

  // console.log(navStateData);
  //console.log(user);
  console.log("navStateData", JSON.stringify(navStateData, null, 2));

  const redirectTo =
    navStateData.state?.redirect && navStateData.state.redirect.startsWith("/")
      ? navStateData.state.redirect
      : "/";

  // console.log(password,email);
  const authHandler = async (e) => {
    e.preventDefault();
    console.log(e.target.name);
    if (e.target.name === "signin") {
      // setLoading({ ...loading, signIn: true });
      setLoading((prev) => ({ ...prev, signIn: true }));
      //firebase auth
      signInWithEmailAndPassword(auth, email, password)
        .then((userInfo) => {
          // console.log(userInfo);
          dispatch({
            type: Type.SET_USER,
            user: userInfo.user,
          });
          // setLoading({ ...loading, signIn: false });
          setLoading((prev) => ({ ...prev, signIn: false }));
          navigate(redirectTo, { replace: true });
        })
        .catch((err) => {
          setError(err.message);
          // setLoading({ ...loading, signIn: false });
          setLoading((prev) => ({ ...prev, signIn: false }));
        });
    } else {
      // setLoading({ ...loading, signUp: true });
      setLoading((prev) => ({ ...prev, signUp: true }));
      createUserWithEmailAndPassword(auth, email, password)
        .then((userInfo) => {
          // console.log(userInfo);
          dispatch({
            type: Type.SET_USER,
            user: userInfo.user,
          });
          // setLoading({ ...loading, signUp: false });
          setLoading((prev) => ({ ...prev, signUp: false }));
          navigate(redirectTo, { replace: true });
        })
        .catch((err) => {
          setError(err.message);
          // setLoading({ ...loading, signUp: false });
          setLoading((prev) => ({ ...prev, signUp: false }));
        });
    }
  };

  return (
    <>
      {/* <Layout> */}
      <section className={styles.login}>
        {/* logo */}
        <Link to="/">
          <img
            src="https://1000logos.net/wp-content/uploads/2016/10/Amazon-Logo.png"
            alt="logo"
          />
        </Link>
        <div className={styles.login_container}>
          <h1>Sign In</h1>
          <form action="">
            <div>
              <label htmlFor="email">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
              />
            </div>

            <button
              type="submit"
              name="signin"
              onClick={authHandler}
              className={styles.login_signbutton}
            >
              {loading.signIn ? (
                <ClipLoader color="#fff" size={15}></ClipLoader>
              ) : (
                "sign In"
              )}
            </button>
          </form>
          {/* agreement */}
          <p>
            By Signning-in you agree to the Amazone Fake Clone Condition of use
            & Sale. Please see our Privacy Notice, our Cookies Notice and our
            Interest-Based Ads Notice.
          </p>

          {/* creat acc btn */}
          <button
            name="signup"
            type="button"
            onClick={authHandler}
            className={styles.login_btn}
          >
            {loading.signUp ? (
              <ClipLoader color="#fff" size={15}></ClipLoader>
            ) : (
              "Create Your Amazon Account"
            )}
          </button>
          {error && (
            <small style={{ paddingTop: "5px", color: "red" }}>{error}</small>
          )}
        </div>
        {/* form */}
      </section>
      {/* </Layout> */}
    </>
  );
};

export default Auth;
