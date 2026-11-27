import React from "react";
import usePostData from "../../hook/api/postData";

function Test() {
  let res = usePostData("/twilio-sms/send-otp");

  function handleClick() {
    let data = res({ countryCode: "+91", phoneNumer: "7550369673" });

    console.log("res", data);
  }

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

export default Test;
