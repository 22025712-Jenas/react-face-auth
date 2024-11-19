import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      className="bg-white py-40 md:pt-60 md:pb-24"
      style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <h1 className="block text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-900">
            Input face
          </h1>
          <p className="mt-8 text-md text-white max-w-3xl mx-4 md:mx-16 lg:mx-auto">
            Look into the front camera and select "Take Photo"
          </p>
          <p className="mt-8 text-md font-bold text-white max-w-3xl mx-4 md:mx-16 lg:mx-auto">
            By selecting "Take Photo", you consent to us electronically capturing and using your facial data to authenticate you in connection, and agree to the Terms of Use and Privacy Statement.
          </p>

          <Link
            to={"/Capture"}
            className="flex gap-2 mt-12 w-fit mx-auto cursor-pointer z-10 py-3 px-6 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-500"
          >
            <span className="text-white">Capture Photo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
