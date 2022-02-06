import Head from 'next/head'
import type { NextPage } from 'next'
import { useRef } from 'react'
import Router from 'next/router'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const input = useRef<HTMLInputElement>()
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Empire!
        </h1>

        <p className={styles.description}>
          User ID: <br />
          <input ref={input} /> <br />
          <button onClick={() => {
            localStorage.setItem("login", input.current ? input.current.value : null);
            Router.push("/board")
          }}>Go!</button> <br />
          <a style={{color: "#0070f3"}} href="/board/create_user">Create a user</a><br />
          <a style={{color: "#0070f3"}} href="/board">If you are already logged in</a>
        </p>
      </main>
    </div>
  )
}

export default Home
