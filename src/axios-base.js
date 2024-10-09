import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:1000/api/v1/",
  baseURL: "https://adw.naog.edu.mn/api/",
});

instance.defaults.withCredentials = true;

export default instance;
