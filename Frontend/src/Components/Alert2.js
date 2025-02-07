import React from "react";

const Alert2 = (props) => {
  return (
    props.alert2 && (
      <div
        className={`alert2Class p-3 max-w-96 text-md ${
          props.alert2.type === "success"
            ? "text-green-800 bg-green-100 "
            : "text-red-800 bg-red-100"
        }  rounded-lg  dark:bg-gray-800 dark:text-green-400`}
        role="alert"
      >
        <span className="font-medium">
          <b>{props.alert2.type === "success" ? "Success: " : "Error: "}</b>
        </span>
        {props.alert2.msg}
      </div>
    )
  );
};

export default Alert2;
