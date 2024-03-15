
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import BigNumber from "bignumber.js";
import products from "./products.json";

//const usdcAddress = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); //Endereço do Contrato USDC DevNET
const usdcAddress = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"); //Endereço do Contrato USDC Main NET

//const sellerAddress = "B1aLAAe4vW8nSQCetXnYqJfRxzTjnbooczwkUJAr7yMS";
const sellerAddress = "8MAqyWFps17iyMyqe1XzrWtaC4xZdH9A7c8hn1Rv8PMu";  //Minha

const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (req, res) => {
  try {
    const { buyer, orderID, itemID } = req.body;
    if (!buyer) {
      res.status(400).json({
        message: "Faltando o endereço do comprador",
      });
    }

    if (!orderID) {
      res.status(400).json({
        message: "Faltando a identificação do pedido",
      });
    }

    const itemPrice = products.find((item) => item.id === itemID).price;

    if (!itemPrice) {
      res.status(404).json({
        message: "Item não encontrado. Favor verificar a identificação do item",
      });
    }

    const bigAmount = BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);

    //const network = WalletAdapterNetwork.Devnet; //DEV NET
    //const network = WalletAdapterNetwork.Mainnet;
        
    //const endpoint = clusterApiUrl(network);
    const endpoint = 'https://solana-mainnet.api.syndica.io/api-token/2XgTD2j17cMPjgVr3RsYg7M3ZctJuh6HQCMtq6LxwVd1BQ2UZ2mCd79QhuYtYXha6ZkcFMJtddcTd6wgnsHZWnasVGDrofALtYCYeB5qngqfkovJALvsQ5URnz1C2kJhENeRwi41K5jkKEip4WrwCQdtHUvJepQU1NeZAk8SXB2eqgxGXJkVppWDQQsirz61iN31BJPqLUBDX8GGxT8HR5kbhYpibMH2uaCRJkakjduG9zjLFqYcPdCquBEutRCnJwdAM4rZy8MWTivrChNcEkSvNWAAigr5ncAfvj8qurvjPxm5rncjhD6ic4xofz6HXcJMan5oGV8EPrK9PpF8aimnNo1QK74iwc5ZXQfXNCNy742RvjJZx8hshnY5ospWHiprMscDWy9BzwFo8UqWJg4ruZUq2Xp9oae1T5iTyM5Y14PpzKsUHxtve3hHkJeL1mRP93DFY5eQKSpJkrDowxAmGgo7n3dJuXVYoRvxMjQGUGk1yUDWxTtdsdKiy'
    const connection = new Connection(endpoint);

    const buyerUsdcAddress = await getAssociatedTokenAddress(usdcAddress, buyerPublicKey);
    const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, sellerPublicKey);
    const { blockhash } = await connection.getLatestBlockhash("finalized");


    // Isto é novo, estamos recebendo o endereço da cunhagem do token que queremos transferir
    const usdcMint = await getMint(connection, usdcAddress);


    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });


    // Aqui estamos criando um tipo diferente de instrução de transferência
    const transferInstruction = createTransferCheckedInstruction(
      buyerUsdcAddress, 
      usdcAddress,     // Este é o endereço do token que queremos transferir
      shopUsdcAddress, 
      buyerPublicKey, 
      bigAmount.toNumber() * 10 ** (await usdcMint).decimals, 
      usdcMint.decimals // O token pode ter qualquer número de decimais
    );

    // O resto permanece o mesmo 😊 
    transferInstruction.keys.push({
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });

    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: "error creating transaction" });
    return;
  }
};

export default function handler(req, res) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}