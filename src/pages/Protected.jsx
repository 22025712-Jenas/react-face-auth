import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Protected() {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const faceAuth = localStorage.getItem("faceAuth");
    
    if (!faceAuth) {
      navigate("/login");
      return; 
    }

    const { account } = JSON.parse(faceAuth);
    setAccount(account);
  }, [navigate]);

  if (!account) {
    return null; 
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-12">
          You have been authenticated
        </h2>
        <div className="text-center mb-24">
          <img
            className="mx-auto mb-8 object-cover h-48 w-48 rounded-full"
            src={
              account?.type === "CUSTOM"
                ? account.picture
                : `/temp-accounts/${account.picture}`
            }
            alt={account.fullName}
          />
          <div
            onClick={() => {
              localStorage.removeItem("faceAuth");
              navigate("/");
            }}
            className="flex gap-2 mt-12 w-fit mx-auto cursor-pointer z-10 py-3 px-6 rounded-full bg-gradient-to-r from-red-400 to-red-600"
            style={{ border: "none" }} 
          >
            <span className="text-white">Log Out</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Protected;
