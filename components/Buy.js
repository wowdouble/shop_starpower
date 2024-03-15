import React, { useState, useEffect, useMemo } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { findReference, FindReferenceError } from '@solana/pay';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { InfinitySpin } from 'react-loader-spinner';
import IPFSDownload from './IpfsDownload';
import { addOrder, hasPurchased, fetchItem } from "../lib/api";

const STATUS = {
  Initial: 'Initial',
  Submitted: 'Submitted',
  Paid: 'Paid',
};

export default function Buy({ itemID }) {

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Chave pública usada para identificar o pedido

  const [item, setItem] = useState(null); // hash IPFS & nome do arquivo do item comprado
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.Initial); // Acompanhamento do status da transação

  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
    }),
    [publicKey, orderID, itemID]
  );

  // Buscar o objeto da transação no servidor (feito para evitar adulterações)
  const processTransaction = async () => {

    setLoading(true);
    const txResponse = await fetch('../api/createTransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    const txData = await txResponse.json();
    
    const tx = Transaction.from(Buffer.from(txData.transaction, 'base64'));
    console.log('开始交易', tx);

    try {
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `hash: https://solscan.io/tx/${txHash}?cluster=mainnet`
      );
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkPurchased() {
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        const item = await fetchItem(itemID);
        setItem(item);
        console.log("<<< O endereço já adquiriu esse item! >>>");
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);
  
  useEffect(() => {
    
    // Verifique se a transação foi confirmada
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
             const result = await findReference(connection, orderID);
             console.log('Encontrando referência da tx', result.confirmationStatus);
            if (
               result.confirmationStatus === 'confirmed' ||
               result.confirmationStatus === 'finalized'
            ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            setLoading(false);
            addOrder(order);
            alert('pay success !');
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error('pay error', e);
        } finally {
          setLoading(false);
        }
      }, 2000);
      return () => {
        clearInterval(interval);
      };
    }

    async function getItem(itemID) {
      const item = await fetchItem(itemID);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }
    
  }, [status]);

  if (!publicKey) {
    return (
      <div>
        <p>https://www.starpower.world/</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="gray" />;
  }

  return (
      <div>
        <button disabled={loading} className="buy-button" onClick={processTransaction}>
          Comprar
        </button>
      </div>
  );
}