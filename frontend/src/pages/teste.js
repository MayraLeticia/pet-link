"use client"
import Head from 'next/head';
import GeolocationTest from '../components/GeolocationTest/index';
import { loginUser } from '../services/api';

export default function GeolocationTestPage() {
  return (
    <div className="container">
      <Head>
        <title>Teste de Geolocalização</title>
        <meta name="description" content="Teste de geolocalização para PetLink" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="main">
        <h1 className="title">
          Teste de Geolocalização
        </h1>

        <p className="description">
          Este é um teste para obter a localização do dispositivo e enviar para o banco de dados.
        </p>

        <GeolocationTest />
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          text-align: center;
          margin: 1rem 0 2rem 0;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
