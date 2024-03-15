import React from "react";
import Head from "next/head";

export default function HeadComponent() {
  return (
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="theme-color" content="#000000" />

      <title>https://www.starpower.world/</title>
      <meta name="title" content="https://www.starpower.world/" />
      <meta name="description" content="https://www.starpower.world/" />

      {/* Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.starpower.world/" />
      <meta property="og:title" content="starpower" />
      <meta property="og:description" content="starpower Solana Pay!" />
      {/*<meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/web3dev-bootcamp.appspot.com/o/courses_cover%2FSolana_Pay_Store_256.jpeg?alt=media&token=c1e28101-d7e2-4512-9f5b-b199e6df10e4" />*/}

      {/* Twitter */}
      <meta property="twitter:url" content="https://www.starpower.world/" />
      <meta property="twitter:title" content="starpower" />
      <meta property="twitter:description" content="starpower Pay!" />
      {/*<meta property="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/web3dev-bootcamp.appspot.com/o/courses_cover%2FSolana_Pay_Store_256.jpeg?alt=media&token=c1e28101-d7e2-4512-9f5b-b199e6df10e4" />*/}
    </Head>
  );
}
