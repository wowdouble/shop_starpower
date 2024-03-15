
//useMemo() é um gancho do React que carrega alguma coisa somente se uma das dependências mudar
import React, { useMemo } from "react";

// Objeto enumerável para as redes disponíveis.
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

//Componente sofisticado do React que solicitará ao usuário que selecione sua carteira. Bem fácil!
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

//ConnectionProvider recebe um ponto de extremidade RPC e nos permite falar diretamente com os nós na blockchain Solana. Usaremos isso sempre em nosso aplicativo para enviar transações.

//WalletProvider nos dá uma interface padrão para conectar a todos os tipos de carteiras, então não precisamos nos preocupar em ler a documentação de cada carteira hehe.

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import "../styles/App.css";

const App = ({ Component, pageProps }) => {
 
  // Pode ser definido como 'devnet', 'testnet' ou 'mainnet-beta'
  //const network = WalletAdapterNetwork.Devnet;
  const network = WalletAdapterNetwork.Mainnet;  //MainNET
  
  // Você também pode fornecer um ponto de extremidade RPC personalizado
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets inclui todos os adaptadores, mas dá suporte a tree
   const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
