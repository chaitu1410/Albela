import React from "react";
import router from "next/router";
import adminStyles from "../../styles/pages/admin/AdminIndex.module.css";
import { useStateValue } from "../../context/StateProvider";
import Head from "next/head";

const index = () => {
  const [{}, dispatch] = useStateValue();

  return (
    <div className={adminStyles.index}>
      <Head>
        <title>Albela (Admin) | Authentication</title>
      </Head>
      <input
        autoFocus
        onChange={(e) => {
          if (e.target.value === "0000") {
            dispatch({
              type: "SET_IS_ADMIN_VALIDATED",
              isAdminValidated: true,
            });
            router.replace("/albela-admin/seller-shops");
          }
        }}
        className={adminStyles.inputs}
        placeholder="Password"
        type="password"
      />
    </div>
  );
};

export default index;
