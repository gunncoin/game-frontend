import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <Head>
        <title>Empire</title>
        <meta name="description" content="Conquer others in this asynchronous strategy game!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
