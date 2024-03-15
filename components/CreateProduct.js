
import React, { useState } from "react";
import { create } from "ipfs-http-client";
import styles from "../styles/CreateProduct.module.css";

//const client = create("https://ipfs.infura.io:5001/api/v0");
//const client = create("https://ipfs.infura.io:5001");

const ipfsClient = require('ipfs-http-client');

const projectId = '2SEAcJ6t5fEtoVf7yv9GMHbEGVL';
const projectSecret = 'b621b0fe535335271e84288e8bcf6dc3';
const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

client.pin.add('QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn').then((res) => {
    console.log(res);
});


////////////////////////////////////////////////////////////////////////////////////////////////
/*const https = require("https");

const projectId = "2SEAcJ6t5fEtoVf7yv9GMHbEGVL";
const projectSecret = "b621b0fe535335271e84288e8bcf6dc3";

const options = {
  host: "ipfs.infura.io",
  port: 5001,
  path: "/api/v0/pin/add?arg=QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn",
  method: "POST",
  auth: projectId + ":" + projectSecret,
};

let req = https.request(options, (res) => {
  let body = "";
  res.on("data", function (chunk) {
    body += chunk;
  });
  res.on("end", function () {
    console.log(body);
  });
});
req.end();*/
////////////////////////////////////////////////////////////////////////////////////////////////


const CreateProduct = () => {

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image_url: "",
    description: "",
  });

  const [file, setFile] = useState({});
  const [uploading, setUploading] = useState(false);

  async function onChange(e) {
    setUploading(true);
    const files = e.target.files;
    try {
      console.log(files[0]);
      const added = await client.add(files[0]);
      setFile({ filename: files[0].name, hash: added.path });
    } catch (error) {
      console.log("Erro ao fazer upload do arquivo: ", error);
    }
    setUploading(false);
  }

  const createProduct = async () => {
    try {
      // Combine dados do produto e file.name
      const product = { ...newProduct, ...file };
      console.log("Enviando produto para api",product);
      const response = await fetch("../api/addProduct", {
        method: "POST",       
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert("Produto adicionado!");
      }
      else{
        alert("Não foi possível adicionar o produto: ", data.error);
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.background_blur}>
      <div className={styles.create_product_container}>
        <div className={styles.create_product_form}>
          <header className={styles.header}>
            <h1>Cadastrar Produto</h1>
          </header>

          <div className={styles.form_container}>
            <input
              type="file"
              className={styles.input}
              accept=".zip,.rar,.7zip"
              placeholder="Moon"
              onChange={onChange}
            />
            {file.name != null && <p className="file-name">{file.filename}</p>}
            <div className={styles.flex_row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Product Name"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, name: e.target.value });
                }}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="0.30 USDC"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, price: e.target.value });
                }}
              />
            </div>
            
            <div className={styles.flex_row}>
              <input
                className={styles.input}
                type="url"
                placeholder="Image URL ex: https://i.imgur.com/rVD8bjt.png"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, image_url: e.target.value });
                }}
              />
            </div>      
            <textarea
              className={styles.text_area}
              placeholder="Descrição aqui..."
              onChange={(e) => {
                setNewProduct({ ...newProduct, description: e.target.value });
              }}
            />

            <button
              className={styles.button}
              onClick={() => {
                createProduct();
              }}
              disabled={uploading}
            >
              Criar Produto
              
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;