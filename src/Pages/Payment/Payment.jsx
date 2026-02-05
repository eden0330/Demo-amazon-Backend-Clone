import React, { useContext,useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import styles from "./Payment.module.css";
import { DataContext } from "../../components/DataProvider/DataProvider";
import ProductCard from "../../components/Product/ProductCard";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CurrencyFormat from "../../components/Format/CurrencyFormat";
import axios from "axios"
import { db } from "../../Utility/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { Type } from "../../Utility/action.type";
import { ClipLoader } from "react-spinners";


// const navigate = useNavigate();



const API_BASE = import.meta.env.VITE_API_BASE_URL;


const Payment = () => {
  const [{ basket, user },dispatch] = useContext(DataContext);
  const navigate = useNavigate();

  console.log(user);

 const stripe = useStripe();
 const elements = useElements();
 const [error, setError] = useState("");
 const [disabled, setDisabled] = useState(true);
const [cardError, setCardError] = useState("");

const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);


  const totalItem = basket?.reduce((amount, item) => {
    return (item.amount ?? 1) + amount;
  }, 0);

//  const total = basket?.reduce((amount, item) => {
//    return item.price * item.amount + amount;
//  }, 0);

 const total = basket?.reduce((amount, item) => {
   return amount + item.price * (item.amount ?? 1);
 }, 0);


//get client secret

  const totalCents = Math.round(total * 100);

  useEffect(() => {
    const getClientSecret = async () => {
      setCardError("");
      setSucceeded(false);

      if (totalCents <= 0) {
        setClientSecret("");
        return;
      }

      const res = await axios.post(
        `${API_BASE}/payment/create?total=${totalCents}`
      );
      setClientSecret(res.data.clientSecret);
    };

    getClientSecret().catch((e) => {
      setClientSecret("");
      setCardError(
        e?.response?.data?.message || e.message || "Failed to start payment"
      );
    });
  }, [totalCents]);




  const handleChange =  (e) => {
    console.log(e);
    // e.error?.message? setCardError(e?.error?.message):setCardError("")
     setDisabled(e.empty);
     setCardError(e.error ? e.error.message : "");
  };

const handlePayment = async (e) => {
  e.preventDefault();


  //1 function contact to get the client secret

  if (!stripe || !elements) return;
  if (!clientSecret) {
    setCardError("Missing client secret");
    return;
  }

  setProcessing(true);
  setCardError("");

  const card = elements.getElement(CardElement);
  if (!card) {
    setCardError("Card element not ready");
    setProcessing(false);
    return;
  }

  //2 client side or react side confirmation by usimg stripe

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: {
        email: user?.email || "guest@example.com",
      },
    },
  });

  if (result.error) {
    setCardError(result.error.message);
    setProcessing(false);
    return;
  }

  //3 after the confirmation order the firestore database save then clear basket

dispatch({ type: Type.EMPTY_BASKET });

  const paymentIntent = result.paymentIntent;
  

  if (paymentIntent && paymentIntent.status === "succeeded") {
    setSucceeded(true);
navigate("/orders", {state:{msg:"You have placed new order"}});
    if (user?.uid) {
      const orderRef = doc(db, "users", user.uid, "orders", paymentIntent.id);

      await setDoc(orderRef, {
        basket,
        amount: paymentIntent.amount,
        created: paymentIntent.created,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });
    }

    dispatch({ type: Type.EMPTY_BASKET });
  }

  setProcessing(false);
};


  return (
    <Layout>
      {/* header */}

      <div className={styles.payment_header}>Chekout ({totalItem}) items</div>
      {/* payment-method */}
      <section className={styles.payment}>
        {/* adress */}
        <div className={styles.flex}>
          <h3>Delivery Adress</h3>
          <div>
            <div>{user?.email || "Guest"}</div>
            <div>123456</div>
            <div>DireDawa,Konel</div>
          </div>
        </div>
        <hr />
        {/* product */}
        <div className={styles.flex}>
          <h3>Review items and delivery</h3>
          <div>
            {basket?.map((item) => (
              <ProductCard product={item} flex={true} />
            ))}
          </div>
        </div>
        <hr />
        {/* card-form */}
        <div className={styles.flex}>
          <h3>Payment Methods</h3>
          <div className={styles.payment_card_container}>
            <div className={styles.payment_detailes}>
              <form action="" onSubmit={handlePayment}>
                {cardError && (
                  <small style={{ color: "red" }}>{cardError}</small>
                )}
                {succeeded && (
                  <small style={{ color: "green" }}>Payment succeeded</small>
                )}
                <CardElement onChange={handleChange} />

                {/* price */}

                <div className={styles.payment_prices}>
                  <div>
                    <span style={{ display: "flex", gap: "10px" }}>
                      <p>Total Order |</p>
                      <CurrencyFormat amount={total} />{" "}
                    </span>
                  </div>
                  {/* <button
                    type="submit"
                    disabled={
                      processing ||
                      disabled ||
                      succeeded ||
                      !stripe ||
                      !clientSecret
                    }
                  >
                    {processing ? "Processing" : "Pay Now"}
                  </button> */}
                  <button type="submit">
                    {
                      processing? (
                        <div className={styles.loadings}>
                          <ClipLoader color="grey" size={12} />
                          <p>please wait ....</p>
                        </div>
                      ):"Pay Now"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Payment;
