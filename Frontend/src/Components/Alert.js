import React from "react";

const Alert = (props) => {
  return (
    props.alert && (
      <div
        className={`alertClass p-1 w-full text-sm ${
          props.alert.type === "success"
            ? "text-green-800 bg-green-100 "
            : "text-red-800 bg-red-100"
        }  rounded-lg  dark:bg-gray-800 dark:text-green-400`}
        role="alert"
      >
        <span className="font-medium">
          <b>{props.alert.type === "success" ? "Success: " : "Error: "}</b>
        </span>
        {props.alert.msg}
      </div>
    )
  );
};

export default Alert;
