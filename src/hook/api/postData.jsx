import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import toast from "react-hot-toast";

const usePostData = (uri) => {
  const backend_uri = useContext(AppContext);
  console.log("backeduri", backend_uri);

  async function postData(data) {
    try {
      let res = await axios.post(backend_uri + uri, { ...data });

      console.log("res", res.data);
      return res;
    } catch (error) {
      return error.response.data;
    }
  }
  return postData;
};

export default usePostData;
