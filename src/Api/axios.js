import axios from "axios";

const axiosinstance = axios.create({
  //deployed version of amazon server on render

  // baseURL: "https://amazon-clone-deploy-e1nc.onrender.com",
  baseURL: "https://amazon-api-clone-deploy-2.onrender.com"
});
export { axiosinstance };